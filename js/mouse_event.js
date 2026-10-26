document.addEventListener("DOMContentLoaded", function () {

  // 1. 기술 스택 칩: 마우스를 올리면 강조, 나가면 원래대로
  const chips = document.querySelectorAll(".chips li");
  chips.forEach(function (chip) {
    chip.addEventListener("mouseover", function () {
      chip.classList.add("is-hover");
    });
    chip.addEventListener("mouseout", function () {
      chip.classList.remove("is-hover");
    });
  });

  // 2. 프로필 사진: 올리면 테두리 색이 바뀌고 나가면 돌아옴
  const photo = document.querySelector(".photo");
  if (photo) {
    photo.addEventListener("mouseover", function () {
      photo.classList.add("is-hover");
    });
    photo.addEventListener("mouseout", function () {
      photo.classList.remove("is-hover");
    });
  }
});