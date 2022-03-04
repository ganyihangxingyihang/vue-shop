var arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
var arr2 = arr.filter(function (x, index) {
  return index % 3 === 0 || x >= 8
})
console.log(arr2) //[1, 4, 7, 8, 9, 10]
