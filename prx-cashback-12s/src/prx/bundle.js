/* @ds-bundle: {"format":4,"namespace":"PRX","components":[{"name":"Button"},{"name":"CategoryChip"},{"name":"OfferCard"},{"name":"Avatar"},{"name":"InputField"},{"name":"Modal"}]} */
(function () {
  var h = window.React.createElement;

  function Button(props) {
    var variant = props.variant || "primary";
    var size = props.size || "large";
    var children = props.children;
    var className = ["prx-btn", "prx-btn-" + variant, "prx-btn-" + size, props.className].filter(Boolean).join(" ");
    return h("button", { className: className, onClick: props.onClick }, children);
  }

  function InputField(props) {
    var label = props.label || "Label";
    var value = props.value || "Value";
    var error = props.error;
    var className = ["prx-input", error ? "prx-input-error" : "", props.className].filter(Boolean).join(" ");
    return h(
      "div",
      { className: className },
      h("p", { className: "prx-input-label" }, label),
      h("div", { className: "prx-input-box" }, h("p", { className: "prx-input-value" }, value)),
      error ? h("p", { className: "prx-input-error-text" }, error) : null
    );
  }

  function Modal(props) {
    var title = props.title || "Lorem Ipsum";
    var body = props.body || "Lorem ipsum dolor sit amet, consectetur";
    var primaryLabel = props.primaryLabel || "Link Card";
    var secondaryLabel = props.secondaryLabel || "No Thanks";
    return h(
      "div",
      { className: "prx-modal" },
      h("p", { className: "prx-modal-title" }, title),
      h("p", { className: "prx-modal-body" }, body),
      h(
        "div",
        { className: "prx-modal-actions" },
        h(Button, { variant: "secondary", size: "compact", className: "prx-modal-btn" }, secondaryLabel),
        h(Button, { variant: "primary", size: "compact", className: "prx-modal-btn" }, primaryLabel)
      )
    );
  }

  function CategoryChip(props) {
    var color = props.color || "category-pink";
    var label = props.label || "Home";
    var icon = props.icon;
    var className = ["prx-chip", "prx-chip-" + color, props.className].filter(Boolean).join(" ");
    return h(
      "div",
      { className: className },
      icon ? h("span", { className: "prx-chip-icon" }, icon) : null,
      h("span", null, label)
    );
  }

  function OfferCard(props) {
    var state = props.state || "filled";
    var merchant = props.merchant || "Merchant Name";
    var category = props.category || "Category";
    var earnLabel = props.earnLabel || "Earn ~$XX";
    if (state === "loading") {
      return h(
        "div",
        { className: "prx-offer prx-offer-loading" },
        h("div", { className: "prx-offer-image" }),
        h("div", { className: "prx-offer-skel prx-offer-skel-sm" }),
        h("div", { className: "prx-offer-skel prx-offer-skel-lg" })
      );
    }
    return h(
      "div",
      { className: "prx-offer" },
      h(
        "div",
        { className: "prx-offer-image" },
        h("span", { className: "prx-tag prx-tag-secondary" }, "Instore"),
        h("span", { className: "prx-tag prx-tag-primary" }, "Online")
      ),
      h(
        "div",
        { className: "prx-offer-text" },
        h("p", { className: "prx-offer-category" }, category),
        h("p", { className: "prx-offer-merchant" }, merchant)
      ),
      h(
        "div",
        { className: "prx-offer-ctas" },
        h(Button, { variant: "primary", className: "prx-offer-cta" }, earnLabel),
        h(Button, { variant: "secondary", className: "prx-offer-cta" }, earnLabel)
      )
    );
  }

  function Avatar(props) {
    var initials = (props.initials || "F").slice(0, 1);
    return h("div", { className: "prx-avatar" }, h("span", null, initials));
  }

  window.PRX = window.PRX || {};
  Object.assign(window.PRX, {
    Button: Button,
    CategoryChip: CategoryChip,
    OfferCard: OfferCard,
    Avatar: Avatar,
    InputField: InputField,
    Modal: Modal
  });
})();
