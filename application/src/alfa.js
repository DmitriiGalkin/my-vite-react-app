/**
 * Задача: Реализуйте полифилл метода Array.prototype.myMap
 *
 * Поведение должно быть аналогично встроенному map:
 * - не изменяет исходный массив
 * - вызывает callback для каждого элемента: (element, index, array)
 * - возвращает новый массив
 * - должна поддерживаться передача thisArg
 * - должна корректно обрабатывать sparse-массивы (пустые элементы)
 */

// callback = (i,index,array) => console.log(i,index,array)
Array.prototype.myMap = function (callback, thisArg) {
  // твой код здесь
    const arr = this;
    for(let i = 0; i < arr.length; i++) {
        if(arr[i] === undefined) continue;
        callback.call(thisArg, arr[i], i, arr);
    }
};

[1,2,3].map((i,index,array) => console.log(i,index,array))