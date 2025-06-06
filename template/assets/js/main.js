document.addEventListener("DOMContentLoaded", function () {
  window.innerWidth < 992 &&
    (document.querySelectorAll(".navbar .dropdown").forEach(function (n) {
      n.addEventListener("hidden.bs.dropdown", function () {
        this.querySelectorAll(".submenu").forEach(function (n) {
          n.style.display = "none";
        });
      });
    }),
    document.querySelectorAll(".dropdown-menu a").forEach(function (n) {
      n.addEventListener("click", function (n) {
        let e = this.nextElementSibling;
        e &&
          e.classList.contains("submenu") &&
          (n.preventDefault(),
          "block" == e.style.display
            ? (e.style.display = "none")
            : (e.style.display = "block"));
      });
    }));
});
