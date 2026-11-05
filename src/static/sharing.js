window.activitySharing = (() => {
  let lastFocusedHash = "";

  function activityId(name) {
    return `activity-${encodeURIComponent(name)}`;
  }

  function activityUrl(name) {
    const url = new URL("index.html", window.location.href);
    url.search = "";
    url.hash = new URLSearchParams({ activity: name }).toString();
    return url.href;
  }

  function createControls(name) {
    const container = document.createElement("div");
    container.className = "activity-sharing";
    container.setAttribute("role", "group");
    container.setAttribute("aria-label", `Share ${name}`);

    const label = document.createElement("span");
    label.className = "sharing-label";
    label.textContent = "Share with friends:";
    container.appendChild(label);

    const actions = document.createElement("div");
    actions.className = "sharing-actions";
    container.appendChild(actions);

    const url = activityUrl(name);
    const text = `Join me for ${name} at Mergington High School!`;
    const destinations = [
      ["WhatsApp", "https://wa.me/", { text: `${text} ${url}` }],
      ["Facebook", "https://www.facebook.com/sharer/sharer.php", { u: url }],
      ["X", "https://twitter.com/intent/tweet", { text, url }],
    ];

    destinations.forEach(([label, baseUrl, parameters]) => {
      const link = document.createElement("a");
      link.className = "share-link";
      link.textContent = label;
      link.setAttribute("aria-label", `Share ${name} on ${label}`);
      link.href = `${baseUrl}?${new URLSearchParams(parameters)}`;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      actions.appendChild(link);
    });

    const status = document.createElement("p");
    status.className = "sharing-status";
    status.setAttribute("role", "status");
    status.setAttribute("aria-live", "polite");

    const manualLink = document.createElement("input");
    manualLink.type = "text";
    manualLink.readOnly = true;
    manualLink.value = url;
    manualLink.className = "manual-share-link hidden";
    manualLink.setAttribute("aria-label", `Link to ${name}`);

    const copyButton = document.createElement("button");
    copyButton.type = "button";
    copyButton.textContent = "Copy link";
    copyButton.setAttribute("aria-label", `Copy link to ${name}`);
    copyButton.addEventListener("click", async () => {
      try {
        if (!navigator.clipboard?.writeText) {
          throw new Error("Clipboard is not available");
        }
        await navigator.clipboard.writeText(url);
        manualLink.classList.add("hidden");
        status.textContent = "Link copied! Paste it into a message to a friend.";
      } catch (error) {
        console.error("Could not copy activity link:", error);
        status.textContent = "Could not copy automatically. Select and copy the link below.";
        manualLink.classList.remove("hidden");
        manualLink.focus();
        manualLink.select();
      }
    });
    actions.appendChild(copyButton);

    if (typeof navigator.share === "function") {
      const shareButton = document.createElement("button");
      shareButton.type = "button";
      shareButton.textContent = "More...";
      shareButton.setAttribute("aria-label", `More sharing options for ${name}`);
      shareButton.addEventListener("click", async () => {
        try {
          await navigator.share({ title: name, text, url });
        } catch (error) {
          if (error.name !== "AbortError") {
            console.error("Could not share activity:", error);
            status.textContent = "Could not open sharing. Try Copy link or a sharing button.";
          }
        }
      });
      actions.appendChild(shareButton);
    }

    container.append(status, manualLink);
    return container;
  }

  function focusSharedActivity() {
    const name = new URLSearchParams(window.location.hash.slice(1)).get("activity");
    document.querySelectorAll(".shared-activity").forEach((card) => {
      card.classList.remove("shared-activity");
    });
    if (!name) {
      lastFocusedHash = "";
      return;
    }

    const card = document.getElementById(activityId(name));
    if (card) {
      card.classList.add("shared-activity");
      if (lastFocusedHash !== window.location.hash) {
        card.focus({ preventScroll: true });
        card.scrollIntoView({ block: "center" });
        lastFocusedHash = window.location.hash;
      }
    }
  }

  window.addEventListener("hashchange", focusSharedActivity);
  return { activityId, createControls, focusSharedActivity };
})();
