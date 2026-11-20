import { readFile } from "node:fs/promises";
import { expect, test, type Page } from "@playwright/test";
import { pressTab, tabTo } from "./keyboard";

const preview = (page: Page) => page.locator("[data-qr-preview]");
const placeholder = (page: Page) => page.locator("[data-qr-placeholder]");
const contrastWarning = (page: Page) => page.locator("[data-qr-contrast]");
const contrastText = (page: Page) => page.locator("[data-qr-contrast-text]");
const capacity = (page: Page) => page.locator("[data-qr-capacity]");
const actionStatus = (page: Page) => page.locator("[data-qr-action-status]");

const selectType = async (page: Page, type: string) => {
  await page.getByLabel("Content type").selectOption(type);
};

const fillUrl = async (page: Page, value: string) => {
  await page.getByLabel("Website URL").fill(value);
  await expect(preview(page).locator("svg")).toBeVisible();
};

const setColor = async (page: Page, label: string, value: string) => {
  await page.getByLabel(label).evaluate((element, color) => {
    const input = element as HTMLInputElement;
    input.value = color;
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
  }, value);
};

const chooseSize = async (page: Page, name: string) => {
  await page.locator(".segmented label").filter({ hasText: name }).click();
  await expect(page.getByRole("radio", { name })).toBeChecked();
};

const toggleSwitch = async (page: Page, name: string) => {
  const control = page.getByRole("switch", { name });
  const wasChecked = await control.isChecked();
  await page.getByText(name, { exact: true }).click();
  if (wasChecked) {
    await expect(control).not.toBeChecked();
  } else {
    await expect(control).toBeChecked();
  }
};

test("loads with the client-side chrome and empty state", async ({ page }) => {
  await page.goto("/qr-code-generator");

  await expect(page).toHaveTitle("QR Code Generator — AppKitX");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "QR Code Generator",
  );

  const breadcrumb = page.getByRole("navigation", { name: "Breadcrumb" });
  await expect(breadcrumb.getByRole("link", { name: "Home" })).toHaveAttribute(
    "href",
    "/",
  );
  await expect(breadcrumb.getByText("QR Code Generator")).toBeVisible();

  await expect(page.getByLabel("Content type")).toHaveValue("url");
  await expect(placeholder(page)).toBeVisible();
  await expect(preview(page)).toBeHidden();
  await expect(page.getByRole("button", { name: "Copy image" })).toBeDisabled();
  await expect(
    page.getByText("Generated in your browser", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText(
      "Your content is encoded locally and never uploaded, stored, or sent to a QR service.",
    ),
  ).toBeVisible();
});

test("generates a live QR code for every content type", async ({ page }) => {
  await page.goto("/qr-code-generator");

  await fillUrl(page, "appkitx.com");
  await expect(preview(page)).toHaveAttribute("data-qr-type", "url");
  await expect(preview(page).locator("svg")).toBeVisible();
  await page.screenshot({
    path: "test-results/qr-code-generator.png",
    fullPage: true,
  });

  await selectType(page, "text");
  await page.getByLabel("Text", { exact: true }).fill("Hello QR");
  await expect(preview(page)).toHaveAttribute("data-qr-type", "text");
  await expect(preview(page).locator("svg")).toBeVisible();

  await selectType(page, "email");
  await page
    .getByLabel("Email address", { exact: true })
    .fill("hello@example.com");
  await expect(preview(page)).toHaveAttribute("data-qr-type", "email");
  await expect(preview(page).locator("svg")).toBeVisible();

  await selectType(page, "phone");
  await page
    .locator('[data-panel="phone"]')
    .getByLabel("Phone number")
    .fill("+1 (555) 123-4567");
  await expect(preview(page)).toHaveAttribute("data-qr-type", "phone");
  await expect(preview(page).locator("svg")).toBeVisible();

  await selectType(page, "sms");
  const smsPanel = page.locator('[data-panel="sms"]');
  await smsPanel.getByLabel("Phone number").fill("+1 (555) 123-4567");
  await smsPanel.getByLabel("Message (optional)").fill("Hello there");
  await expect(preview(page)).toHaveAttribute("data-qr-type", "sms");
  await expect(preview(page).locator("svg")).toBeVisible();

  await selectType(page, "wifi");
  const wifiPanel = page.locator('[data-panel="wifi"]');
  await wifiPanel.getByLabel("Network name (SSID)").fill("Studio");
  await wifiPanel.getByLabel("Password", { exact: true }).fill("secret123");
  await expect(preview(page)).toHaveAttribute("data-qr-type", "wifi");
  await expect(preview(page).locator("svg")).toBeVisible();

  await toggleSwitch(page, "Hidden network");
  await expect(preview(page).locator("svg")).toBeVisible();
  await page.waitForTimeout(200);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({
    path: "test-results/qr-code-generator-wifi.png",
    fullPage: true,
  });
  await toggleSwitch(page, "Hidden network");
  await expect(preview(page).locator("svg")).toBeVisible();

  await selectType(page, "vcard");
  const vcardPanel = page.locator('[data-panel="vcard"]');
  await vcardPanel.getByLabel("Name", { exact: true }).fill("Ada Lovelace");
  await vcardPanel
    .getByLabel("Phone number (optional)")
    .fill("+1 555 123 4567");
  await vcardPanel
    .getByLabel("Email address (optional)")
    .fill("ada@example.com");
  await vcardPanel
    .getByLabel("Organization (optional)")
    .fill("Analytical Engines");
  await vcardPanel.getByLabel("Website (optional)").fill("example.com");

  await expect(preview(page)).toHaveAttribute("data-qr-type", "vcard");
  await expect(preview(page).locator("svg")).toBeVisible();
});

test("downloads a PNG for every content type", async ({ page }) => {
  await page.goto("/qr-code-generator");

  const downloadPng = async (type: string, filename: string) => {
    await expect(preview(page)).toHaveAttribute("data-qr-type", type);
    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("button", { name: "Download PNG" }).click(),
    ]);
    expect(download.suggestedFilename()).toBe(filename);
    const path = await download.path();
    expect(path).not.toBeNull();
    if (path === null) throw new Error(`${type} PNG has no path`);
    const png = await readFile(path);
    expect(
      png
        .subarray(0, 8)
        .equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
      type,
    ).toBe(true);
  };

  await fillUrl(page, "appkitx.com");
  await downloadPng("url", "appkitx-qr-url.png");

  await selectType(page, "text");
  await page.getByLabel("Text", { exact: true }).fill("Hello QR");
  await downloadPng("text", "appkitx-qr-text.png");

  await selectType(page, "email");
  await page
    .getByLabel("Email address", { exact: true })
    .fill("hello@example.com");
  await downloadPng("email", "appkitx-qr-email.png");

  await selectType(page, "phone");
  await page
    .locator('[data-panel="phone"]')
    .getByLabel("Phone number")
    .fill("+1 (555) 123-4567");
  await downloadPng("phone", "appkitx-qr-phone.png");

  await selectType(page, "sms");
  const smsPanel = page.locator('[data-panel="sms"]');
  await smsPanel.getByLabel("Phone number").fill("+1 (555) 123-4567");
  await smsPanel.getByLabel("Message (optional)").fill("Hello there");
  await downloadPng("sms", "appkitx-qr-sms.png");

  await selectType(page, "wifi");
  const wifiPanel = page.locator('[data-panel="wifi"]');
  await wifiPanel.getByLabel("Network name (SSID)").fill("Studio");
  await wifiPanel.getByLabel("Password", { exact: true }).fill("secret123");
  await downloadPng("wifi", "appkitx-qr-wifi.png");

  await selectType(page, "vcard");
  await page
    .locator('[data-panel="vcard"]')
    .getByLabel("Name", { exact: true })
    .fill("Ada Lovelace");
  await downloadPng("vcard", "appkitx-qr-contact.png");
});

test("toggles Wi-Fi password visibility without changing its value", async ({
  page,
  browserName,
}) => {
  await page.goto("/qr-code-generator");
  await selectType(page, "wifi");

  const ssid = page.getByLabel("Network name (SSID)");
  const password = page.locator("#qr-wifi-password");
  const toggle = page.locator("[data-password-toggle]");

  await ssid.fill("Studio");
  await password.fill("s3cret value");
  await expect(password).toHaveAttribute("type", "password");
  await expect(toggle).toHaveAccessibleName("Show Wi-Fi password");
  await expect(toggle).toHaveAttribute("aria-pressed", "false");
  await expect(preview(page).locator("svg")).toBeVisible();

  const attributeValues = await page.evaluate(() =>
    Array.from(document.querySelectorAll("*"))
      .flatMap((element) =>
        Array.from(element.attributes).map((attribute) => attribute.value),
      )
      .join("\n"),
  );
  expect(attributeValues).not.toContain("s3cret value");

  await password.focus();
  await pressTab(page, browserName);
  await expect(toggle).toBeFocused();
  await expect(toggle).toHaveCSS("outline-width", "2px");
  await expect(toggle).toHaveCSS("outline-color", "rgb(13, 148, 136)");
  await page.keyboard.press("Enter");
  await expect(password).toHaveAttribute("type", "text");
  await expect(password).toHaveValue("s3cret value");
  await expect(toggle).toHaveAccessibleName("Hide Wi-Fi password");
  await expect(toggle).toHaveAttribute("aria-pressed", "true");
  await expect(ssid).toHaveValue("Studio");
  await expect(preview(page).locator("svg")).toBeVisible();

  await page.keyboard.press("Enter");
  await expect(password).toHaveAttribute("type", "password");
  await expect(toggle).toHaveAccessibleName("Show Wi-Fi password");
  await expect(toggle).toHaveAttribute("aria-pressed", "false");
  await expect(password).toHaveValue("s3cret value");

  await page.goto("/es/qr-code-generator");
  await page.getByLabel("Tipo de contenido").selectOption("wifi");
  await expect(
    page.getByRole("button", { name: "Mostrar contraseña de Wi-Fi" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Mostrar contraseña de Wi-Fi" })
    .click();
  await expect(
    page.getByRole("button", { name: "Ocultar contraseña de Wi-Fi" }),
  ).toBeVisible();
});

test("customizes size, error correction, quiet zone, and colors", async ({
  page,
}) => {
  await page.goto("/qr-code-generator");
  await fillUrl(page, "appkitx.com");

  await setColor(page, "Foreground color", "#94a3b8");
  await expect(contrastWarning(page)).toBeVisible();
  await expect(contrastText(page)).toContainText("Low contrast");

  await setColor(page, "Foreground color", "#0f172a");
  await expect(contrastWarning(page)).toBeHidden();

  await setColor(page, "Background color", "#000000");
  await setColor(page, "Foreground color", "#ffffff");
  await expect(contrastWarning(page)).toBeVisible();
  await expect(contrastText(page)).toContainText("looks inverted");
  await expect(page.locator('[data-color-value="foreground"]')).toHaveText(
    "#ffffff",
  );

  await chooseSize(page, "Large");
  await expect(preview(page)).toHaveAttribute("data-qr-size", "large");
  await expect(preview(page).locator("svg")).toHaveAttribute("width", "240");

  await page.getByLabel("Error correction").selectOption("H");
  await expect(preview(page)).toHaveAttribute("data-qr-ecc", "H");

  const quietZone = page.getByRole("switch", {
    name: "Include quiet zone",
  });
  await expect(quietZone).toBeChecked();
  await toggleSwitch(page, "Include quiet zone");
  await expect(quietZone).not.toBeChecked();
  await expect(preview(page).locator("svg")).toBeVisible();
});

test("uses 44px QR size targets with 8px gaps and keyboard selection", async ({
  page,
  browserName,
}) => {
  await page.goto("/qr-code-generator");
  await fillUrl(page, "appkitx.com");

  const group = page.locator(".segmented--large");
  const labels = group.locator("label");
  await expect(group).toHaveCSS("gap", "8px");
  await expect(labels).toHaveCount(3);

  for (let index = 0; index < 3; index += 1) {
    const box = await labels.nth(index).boundingBox();
    expect(box).not.toBeNull();
    if (box === null) throw new Error("QR size target has no box");
    expect(box.height).toBeGreaterThanOrEqual(44);
    expect(box.width).toBeGreaterThanOrEqual(44);
  }

  const medium = page.getByRole("radio", { name: "Medium" });
  await expect(medium).toBeChecked();

  /* Reach the radio group with Tab so :focus-visible applies in every engine. */
  await page.getByLabel("Background color").focus();
  await tabTo(page, browserName, medium);

  const mediumLabel = medium.locator("..");
  const outlineWidth = await mediumLabel.evaluate((element) =>
    Number.parseFloat(getComputedStyle(element).outlineWidth),
  );
  expect(outlineWidth).toBeGreaterThanOrEqual(2);
  await expect(mediumLabel).toHaveCSS("outline-style", "solid");
  await expect(mediumLabel).toHaveCSS("outline-color", "rgb(13, 148, 136)");

  await page.keyboard.press("ArrowRight");

  const large = page.getByRole("radio", { name: "Large" });
  await expect(large).toBeChecked();
  await expect(preview(page)).toHaveAttribute("data-qr-size", "large");
  await expect
    .poll(() => large.evaluate((element) => element === document.activeElement))
    .toBe(true);
});

test("downloads exact PNG dimensions and SVG with descriptive filenames", async ({
  page,
}) => {
  await page.goto("/qr-code-generator");
  await fillUrl(page, "appkitx.com");

  const downloadPng = async (size: string, expected: number) => {
    await chooseSize(page, size);

    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("button", { name: "Download PNG" }).click(),
    ]);
    const path = await download.path();
    expect(path).not.toBeNull();
    if (path === null) throw new Error("PNG download has no path");

    const png = await readFile(path);
    expect(
      png
        .subarray(0, 8)
        .equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
      "PNG signature",
    ).toBe(true);
    expect(png.length).toBeGreaterThan(0);
    expect(png.readUInt32BE(16), `${size} PNG width`).toBe(expected);
    expect(png.readUInt32BE(20), `${size} PNG height`).toBe(expected);
    return download;
  };

  const small = await downloadPng("Small", 256);
  expect(small.suggestedFilename()).toBe("appkitx-qr-url.png");
  await downloadPng("Medium", 512);
  const large = await downloadPng("Large", 1024);
  expect(large.suggestedFilename()).toBe("appkitx-qr-url.png");

  const [svgDownload] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: "Download SVG" }).click(),
  ]);
  expect(svgDownload.suggestedFilename()).toBe("appkitx-qr-url.svg");

  const svgPath = await svgDownload.path();
  expect(svgPath).not.toBeNull();
  if (svgPath === null) throw new Error("SVG download has no path");

  const svg = await readFile(svgPath, "utf8");
  expect(svg).toContain("<svg ");
  expect(svg).toContain('width="1024"');
  expect(svg).toContain('height="1024"');
  expect(svg).toContain('shape-rendering="crispEdges"');
  expect(svg).toContain('fill="#0f172a"');
  expect(svg).not.toContain("<script");

  await toggleSwitch(page, "Include quiet zone");
  await downloadPng("Medium", 512);
  await toggleSwitch(page, "Include quiet zone");

  await selectType(page, "text");
  await page.getByLabel("Text", { exact: true }).fill("x".repeat(600));
  await downloadPng("Medium", 512);
  await downloadPng("Large", 1024);
});

test("copies the QR image when the browser supports it", async ({
  page,
  browserName,
}) => {
  test.skip(
    browserName !== "chromium",
    "Image clipboard writing is only guaranteed in Chromium",
  );
  await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/qr-code-generator");
  await fillUrl(page, "appkitx.com");

  await page.getByRole("button", { name: "Copy image" }).click();
  await expect(actionStatus(page)).toHaveText(
    "QR code copied to the clipboard.",
  );

  const types = await page.evaluate(async () => {
    const items = await navigator.clipboard.read();
    return items.flatMap((item) => item.types);
  });
  expect(types).toContain("image/png");
});

test("degrades gracefully when image clipboard support is missing", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "ClipboardItem", {
      configurable: true,
      value: undefined,
    });
  });
  await page.goto("/qr-code-generator");
  await fillUrl(page, "appkitx.com");

  await expect(page.getByRole("button", { name: "Copy image" })).toBeDisabled();
  await expect(
    page.getByText("This browser can't copy images. Download the PNG instead."),
  ).toBeVisible();
});

test("validates required and malformed fields", async ({ page }) => {
  await page.goto("/qr-code-generator");

  await page.getByRole("button", { name: "Download PNG" }).click();
  await expect(page.locator('[data-error-for="url"]')).toContainText(
    "This field is required.",
  );
  await expect(page.getByLabel("Website URL")).toHaveAttribute(
    "aria-invalid",
    "true",
  );

  await page.getByLabel("Website URL").fill("not a url");
  await page.getByRole("button", { name: "Download PNG" }).click();
  await expect(page.locator('[data-error-for="url"]')).toContainText(
    "Enter a valid website URL.",
  );

  await selectType(page, "email");
  await page.getByLabel("Email address", { exact: true }).fill("nope");
  await page.getByRole("button", { name: "Download PNG" }).click();
  await expect(page.locator('[data-error-for="email"]')).toContainText(
    "Enter a valid email address.",
  );

  await selectType(page, "phone");
  await page
    .locator('[data-panel="phone"]')
    .getByLabel("Phone number")
    .fill("abc");
  await page.getByRole("button", { name: "Download PNG" }).click();
  await expect(page.locator('[data-error-for="phone"]')).toContainText(
    "Enter a valid phone number",
  );

  await selectType(page, "wifi");
  const wifiPanel = page.locator('[data-panel="wifi"]');
  await wifiPanel.getByLabel("Network name (SSID)").fill("Studio");
  await page.getByRole("button", { name: "Download PNG" }).click();
  await expect(page.locator('[data-error-for="wifiPassword"]')).toContainText(
    "Enter the network password",
  );

  await selectType(page, "vcard");
  await page.getByRole("button", { name: "Download PNG" }).click();
  await expect(page.locator('[data-error-for="vcardName"]')).toContainText(
    "This field is required.",
  );
});

test("resets the form, customization, and preview", async ({ page }) => {
  await page.goto("/qr-code-generator");
  await fillUrl(page, "appkitx.com");
  await selectType(page, "text");
  await page.getByLabel("Text", { exact: true }).fill("Hello QR");
  await chooseSize(page, "Large");
  await page.getByLabel("Error correction").selectOption("H");
  await toggleSwitch(page, "Include quiet zone");
  await setColor(page, "Foreground color", "#ff0000");

  await page.getByRole("button", { name: "Reset" }).click();

  await expect(page.getByLabel("Content type")).toHaveValue("url");
  await expect(page.getByLabel("Website URL")).toHaveValue("");
  await expect(placeholder(page)).toBeVisible();
  await expect(preview(page)).toBeHidden();
  await expect(page.getByRole("radio", { name: "Medium" })).toBeChecked();
  await expect(page.getByLabel("Error correction")).toHaveValue("M");
  await expect(
    page.getByRole("switch", { name: "Include quiet zone" }),
  ).toBeChecked();
  await expect(page.locator('[data-color-value="foreground"]')).toHaveText(
    "#0f172a",
  );
  await expect(page.getByLabel("Content type")).toBeFocused();

  await page.getByLabel("Content type").selectOption("wifi");
  await page.locator("#qr-wifi-password").fill("secret");
  await page.locator("[data-password-toggle]").click();
  await expect(page.locator("#qr-wifi-password")).toHaveAttribute(
    "type",
    "text",
  );

  await page.getByRole("button", { name: "Reset" }).click();
  await expect(page.locator("#qr-wifi-password")).toHaveAttribute(
    "type",
    "password",
  );
  await expect(page.locator("[data-password-toggle]")).toHaveAttribute(
    "aria-label",
    "Show Wi-Fi password",
  );
});

test("the Spanish page is localized and generates a preview", async ({
  page,
}) => {
  await page.goto("/es/qr-code-generator");

  await expect(page).toHaveTitle("Generador de códigos QR — AppKitX");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Generador de códigos QR",
  );
  await expect(page.getByLabel("Tipo de contenido")).toHaveValue("url");
  await expect(page.getByLabel("URL del sitio web")).toBeVisible();
  await expect(page.getByText("Generado en tu navegador")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Descargar PNG" }),
  ).toBeEnabled();

  await page.getByLabel("URL del sitio web").fill("appkitx.com");
  await expect(preview(page)).toHaveAttribute("data-qr-type", "url");
  await expect(preview(page).locator("svg")).toBeVisible();
});

test("is keyboard operable and shows the design-system focus ring", async ({
  page,
  browserName,
}) => {
  await page.goto("/qr-code-generator");

  await tabTo(page, browserName, page.getByLabel("Content type"));
  await expect(page.getByLabel("Content type")).toHaveCSS(
    "outline-width",
    "2px",
  );

  await tabTo(page, browserName, page.getByLabel("Website URL"));
  await expect(page.getByLabel("Website URL")).toHaveCSS(
    "outline-color",
    "rgb(13, 148, 136)",
  );
  await page.keyboard.type("appkitx.com");
  await expect(preview(page)).toHaveAttribute("data-qr-type", "url");
  await expect(preview(page).locator("svg")).toBeVisible();

  const quietZone = page.getByRole("switch", {
    name: "Include quiet zone",
  });
  await tabTo(page, browserName, quietZone);
  await expect(quietZone.locator("..")).toHaveCSS("outline-width", "2px");

  await page.keyboard.press("Space");
  await expect(quietZone).not.toBeChecked();
  await page.keyboard.press("Space");
  await expect(quietZone).toBeChecked();
});

test("keeps the form and preview usable at 320px", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto("/qr-code-generator");
  await fillUrl(page, "appkitx.com");

  const overflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth -
      document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
  await expect(page.getByLabel("Content type")).toBeVisible();
  await expect(page.getByLabel("Website URL")).toBeVisible();
  await expect(page.locator(".segmented--large")).toBeVisible();
  await expect(preview(page).locator("svg")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Download PNG" }),
  ).toBeVisible();

  await selectType(page, "wifi");
  await expect(page.locator("#qr-wifi-password")).toBeVisible();
  await expect(page.locator("[data-password-toggle]")).toBeVisible();
  const overflowWithPassword = await page.evaluate(
    () =>
      document.documentElement.scrollWidth -
      document.documentElement.clientWidth,
  );
  expect(overflowWithPassword).toBeLessThanOrEqual(0);
});

test("does not transmit or store entered content", async ({ page }) => {
  const requests: string[] = [];
  page.on("request", (request) => {
    requests.push(`${request.url()} ${request.postData() ?? ""}`);
  });

  await page.goto("/qr-code-generator");
  await selectType(page, "text");
  const secret = "private-qr-content-4f8a2c";
  await page.getByLabel("Text", { exact: true }).fill(secret);
  await expect(preview(page).locator("svg")).toBeVisible();

  expect(
    await preview(page).evaluate((element) =>
      element.getAttribute("data-qr-payload"),
    ),
    "the complete payload must not be copied into the DOM",
  ).toBeNull();

  const attributeValues = await page.evaluate(() =>
    Array.from(document.querySelectorAll("*"))
      .flatMap((element) =>
        Array.from(element.attributes).map((attribute) => attribute.value),
      )
      .join("\n"),
  );
  expect(attributeValues).not.toContain(secret);
  expect(await page.content()).not.toContain(secret);
  await page.waitForTimeout(300);

  expect(
    requests.some((request) => request.includes(secret)),
    "QR content must never appear in a request URL or body",
  ).toBe(false);

  const origin = new URL(page.url()).origin;
  expect(
    requests.every((request) => request.startsWith(origin)),
    "QR generation must not call a third-party service",
  ).toBe(true);

  const storage = await page.evaluate(() =>
    JSON.stringify({ local: localStorage, session: sessionStorage }),
  );
  expect(storage).not.toContain(secret);
});

test("reports content that exceeds QR capacity", async ({ page }) => {
  await page.goto("/qr-code-generator");
  await selectType(page, "text");
  await page.getByLabel("Text", { exact: true }).fill("x".repeat(5000));

  await expect(capacity(page)).toBeVisible();
  await expect(capacity(page)).toContainText("too long");
  await expect(preview(page)).toBeHidden();
});
