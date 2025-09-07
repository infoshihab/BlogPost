let taxSwtich = document.getElementById("switchCheckDefault");
taxSwtich.addEventListener("click", () => {
  let taxInfo = document.getElementsByClassName("tax-info");
  for (info of taxInfo) {
    if (info.style.display != "none") {
      info.style.display = "none";
    } else {
      info.style.display = "inline";
    }
  }
});

function scrollFilters(direction) {
  document.getElementById("filters-wrapper").scrollBy({
    left: direction,
    behavior: "smooth",
  });
  setTimeout(toggleScrollButtons, 300);
}

function toggleScrollButtons() {
  const wrapper = document.getElementById("filters-wrapper");
  const leftBtn = document.getElementById("btn-left");
  const rightBtn = document.getElementById("btn-right");

  leftBtn.style.display = wrapper.scrollLeft > 10 ? "flex" : "none";
  rightBtn.style.display =
    wrapper.scrollWidth - wrapper.scrollLeft - wrapper.clientWidth > 10
      ? "flex"
      : "none";
}

// Run on load
window.addEventListener("load", toggleScrollButtons);
window.addEventListener("resize", toggleScrollButtons);
