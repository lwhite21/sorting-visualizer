import React, { useState, useEffect } from 'react';
import { Button, DropdownButton, } from 'react-bootstrap';
import './SortingVisualizer.css';
import DropdownItem from 'react-bootstrap/esm/DropdownItem';
import { Slider } from '@mui/material';
import { message } from 'antd';
import Sound from '../Sound Effects/sort_sound_C4.mp3';


const SECONDARY_COLOR = '#BF40BF';

export default function SortingVisualizer(){
    const [array, setArray] = useState([]);
    const [areButtonsDisabled, setAreButtonsDisabled] = useState(false);
    const [animationSpeed, setAnimationSpeed] = useState(125);
    const [algorithmSelected, setAlgorithmSelected] = useState('Select Algorithm');
    const [arraySize, setArraySize] = useState(125);
    const [isStopped, setIsStopped] = useState(false);
    const [isMuted, setIsMuted] = useState(true);

    // Each in file algorithm's animation array
    const [quickSortAnimations, setQuickSortAnimations] = useState([]);
    const [mergeSortAnimations, setMergeSortAnimations] = useState([]);
    const [bubbleSortAnimations, setBubbleSortAnimations] = useState([]);
    const [heapSortAnimations, setHeapSortAnimations] = useState([]);

    let tempAnimations;
    const [interval, setIntervalS] = useState();
    let intervalIndex = 0;

    useEffect(() => {
        const arrayBars = document.getElementsByClassName('array-bar')
        let tempArray = array.slice();
        tempArray.sort((a, b) => a - b);
        if (areArraysEqual(array.slice(), tempArray)) {
            for (let i = 0; i < arrayBars.length; i++) {
                arrayBars[i].style.backgroundColor = '#32CD32';
            }
            setTimeout(() => {
                for (let i = 0; i < arrayBars.length; i++) {
                    arrayBars[i].style.backgroundColor = getRGBValue(arrayBars[i].style.height);
                }
            }, 750);
        } else {
            for (let i = 0; i < arrayBars.length; i++) {
                arrayBars[i].style.backgroundColor = getRGBValue(arrayBars[i].style.height);
            }
        }

        setAnimationSpeed(3000 / ((Math.log2(array.length) * array.length)));
    }, [array]);

    useEffect(() => resetArray(), []);

    useEffect(() => {
        if (isStopped) {
            clearInterval(interval);
            resetArray();
        }
    }, [isStopped])

    useEffect(() => { 
        if (array.length > 0) sort("quickSort", true); 
    }, [quickSortAnimations]);

    useEffect(() => { 
        if (array.length > 0) sort("mergeSort", true); 
    }, [mergeSortAnimations]);


    useEffect(() => { 
        if (array.length > 0) sort("heapSort", true); 
    }, [heapSortAnimations]);


    function resetArray(){
        setArray([]);
        let tempArray = [];
        for (let i = 0; i < arraySize; i++){
            const valueToPush = Math.random() * 995 + 5;
            tempArray.push(valueToPush);
        }
        setArray(tempArray);
    }

    function sort(algorithm, isReady) {
        let animations = [];
        setTimeout(() => {
            switch (algorithm) {
                case "quickSort":
                    if (!isReady) {
                        animations = getQuickSortAnimations(array);
                    } else {
                        animations = quickSortAnimations;
                    }        
                    break;
                case "mergeSort":
                    if (!isReady) {
                        animations = getMergeSortAnimations(array);
                    } else {
                        animations = mergeSortAnimations;
                    }       
                    break;
                case "bubbleSort":
                    if (!isReady) {
                        animations = getBubbleSortAnimations(array);
                    } else {
                        animations = bubbleSortAnimations;
                    }  
                    break;
                case "heapSort":
                    if (!isReady) {
                        animations = getHeapSortAnimations(array);
                    } else {
                        animations = heapSortAnimations;
                    }
                    break;
            }
        }, 5);

        let animationsSliced = [];
        const arrayBars = document.getElementsByClassName('array-bar');
        let oldBarOneIndex = -1;
        let oldBarTwoIndex = -1;
        intervalIndex = 0;
        if (isReady) {
            setAreButtonsDisabled(true);
            setTimeout(() => {
                animationsSliced = animations.slice();
                setIntervalS(setInterval(produceAnimations, animationSpeed));
            }, 5);
        }

        

        function produceAnimations() {
            if (intervalIndex >= animationsSliced.length - 1) {
                clearInterval(interval);
            } else {
                const isColorChange = intervalIndex % 3 === 0;
                if (isColorChange) {
                    const [barOneIdx, barTwoIdx] = animationsSliced[intervalIndex];
                        // Set old bars to blue
                        if (intervalIndex > 0) {
                            arrayBars[oldBarOneIndex].style.backgroundColor = getRGBValue(arrayBars[oldBarOneIndex].style.height);
                            arrayBars[oldBarTwoIndex].style.backgroundColor = getRGBValue(arrayBars[oldBarTwoIndex].style.height);
                        }
                        // Set new bars to red
                        arrayBars[barOneIdx].style.backgroundColor = SECONDARY_COLOR;
                        arrayBars[barTwoIdx].style.backgroundColor = SECONDARY_COLOR;
                        // Remember bars
                        oldBarOneIndex = barOneIdx;
                        oldBarTwoIndex = barTwoIdx;       
                } else {
                    const audio = new Audio(Sound);
                    audio.volume = 0.02;
                    if (!isMuted) audio.play();
                    const [barOneIdx, newHeight] = animations[intervalIndex];
                    const barOneStyle = arrayBars[barOneIdx].style;
                    barOneStyle.height = `${newHeight / 11.7647058}vh`;
                    barOneStyle.backgroundColor = getRGBValue(arrayBars[barOneIdx].style.height);
                    
                }
            }
            
            if (intervalIndex == animationsSliced.length - 2) {
                // Last frame
                setAreButtonsDisabled(false);
                let tempArray = array.slice();
                tempArray.sort((a, b) => a - b);
                setArray(tempArray);
                clearInterval(interval);
            }
            intervalIndex++;
        }
    }

    const handleChange = (event, newValue) => {
        let newArray = array.slice();
        const difference = newArray.length - newValue;
        if (difference > 0) {
            const temp = newArray.slice(newValue);
            newArray = newArray.slice(0, newValue);
        } else {
            for (let i = 0; i < Math.abs(difference); i++) {
                newArray.push(Math.random() * 995 + 5);
            }
        }
        setArray(newArray);
        setArraySize(newValue);
      };

    return(
        <>
        <div className='button-bar'>
            <Button className='button' variant="link" style={{fontSize: 20, marginLeft: '15px'}} onClick={() => {resetArray()}} disabled={areButtonsDisabled}>Generate New Array</Button>
            <DropdownButton className='button' title={algorithmSelected}>
                <DropdownItem onClick={() => setAlgorithmSelected('Quicksort')}>Quicksort</DropdownItem>
                <DropdownItem onClick={() => setAlgorithmSelected('Merge sort')}>Merge sort</DropdownItem>
                <DropdownItem onClick={() => setAlgorithmSelected('Heapsort')}>Heapsort</DropdownItem>
                <DropdownItem onClick={() => setAlgorithmSelected('Bubble sort')}>Bubble sort</DropdownItem>
            </DropdownButton>
            <Slider className='button' aria-label='Array Size' min={5} max={250} value={arraySize} onChange={handleChange} disabled={areButtonsDisabled} style={{width: '200px'}}/>
            {arraySize}
            <Button className='button' variant="link" style={{fontSize: 20, marginLeft: '15px'}} onClick={() => {runSelectedAlgorithm(); setIsStopped(false)}} disabled={areButtonsDisabled}>Start</Button>
            <Button className='button' variant="link" style={{fontSize: 20, color: 'red'}} onClick={() => {setIsStopped(true); setAreButtonsDisabled(false)}} disabled={!areButtonsDisabled}>Stop</Button>
            <Button className='button' variant="link" style={{fontSize: 20, color: 'red'}} onClick={() => {setIsMuted(!isMuted)}} disabled={areButtonsDisabled}>{isMuted ? 'Unmute' : 'Mute'}</Button>
        </div>
        <div className='array-container'>
            {array.map((value, id) =>(
                <div 
                className='array-bar' 
                key={id} 
                style={{height: `${value / 11.7647058}vh`, width: `${(100.0 / arraySize)}%`}}
                />
            ))}
        </div>
        <div className='bottom-bar'>
            <div className='bottom-bar-text'>Created by Logan White</div>
        </div>
        </>
    );

    function getRGBValue(height) {
        height = height.replaceAll('v', '');
        height = height.replaceAll('h', '');       
        const r = 0;
        const g = 225 - Math.floor(height * 0.882352);
        const b = 255;
        return 'rgb(' + r + ', ' + g + ', ' + b + ')';
    }

    function areArraysEqual(arrOne, arrTwo) {
        if (arrOne.length !== arrTwo.length) return false;
        for (let i = 0; i < arrOne.length; i++) {
            if (arrOne[i] !== arrTwo[i]) return false;
        }
        return true;
    }

    function runSelectedAlgorithm() {
        switch (algorithmSelected) {
            case "Quicksort":
                sort("quickSort", false);
                break;
            case "Merge sort":
                console.log("runSelectedAlgorithm");
                sort("mergeSort", false);
                break;
            case "Heapsort":
                sort("heapSort", false);
                break;
            case "Bubble sort":
                sort("bubbleSort", false);
                break;
            case "Select Algorithm":
                message.error("Please select an algorithm to sort with");
        }
    }

    function getQuickSortAnimations(arr) {
        arr = arr.slice();
        tempAnimations = [];
        getQuickSortAnimations2(arr);
        function getQuickSortAnimations2(arr) {
            if (arr.length <= 1) return arr;
            quickSortHelper(arr, 0, arr.length - 1);
            setQuickSortAnimations(tempAnimations);
        }
        
        
        function quickSortHelper(arr, left, right) {
            if (arr.length < 2) return arr;
            
            const pivot = partition(arr, left, right);
            
            if (left < pivot - 1) {
                quickSortHelper(arr, left, pivot - 1);
            }
            if (right > pivot) {
                quickSortHelper(arr, pivot, right);
            }
            return arr;
        }
        
        function partition(arr, left, right) {
            const pivot = arr[Math.floor((left + right) / 2)];
            let i = left;
            let j = right;
        
            while (i <= j) {
                while (true) {
                    
                    if (arr[i] < pivot) {
                        i++;
                    }
                    if (arr[j] > pivot) {
                        j--;
                    }
                    tempAnimations.push([i, j]);
                    tempAnimations.push([i, arr[i]]);
                    tempAnimations.push([j, arr[j]]);

                    if (arr[i] >= pivot && arr[j] <= pivot){
                        break;
                    }
                }
                
                if (i <= j) {
                    tempAnimations.push([i, j]);
                    tempAnimations.push([j, arr[i]]);
                    tempAnimations.push([i, arr[j]]);
                    [arr[i], arr[j]] = [arr[j], arr[i]];
                    i++;
                    j--;
                }
            }
            return i;
        }
    }

    function getHeapSortAnimations(arr) {
        arr = arr.slice();
        tempAnimations = [];
        getHeapSortAnimations2(arr);
        function getHeapSortAnimations2(arr) {
            if (arr.length <= 1) return arr;
            heapSortHelper(arr, 0, arr.length - 1);
            setHeapSortAnimations(tempAnimations);
        }

        function heapSortHelper( arr)
        {
            let n = arr.length;
    
            for (let i = Math.floor(n / 2) - 1; i >= 0; i--)
                heapify(arr, n, i);
    
            for (let i = n - 1; i > 0; i--) {
                tempAnimations.push([0, i]);
                tempAnimations.push([0, arr[i]]);
                tempAnimations.push([i, arr[0]]);
                [arr[0], arr[i]] = [arr[i], arr[0]];

                heapify(arr, i, 0);
            }
        }
    
        function heapify(arr, n, i)
        {
            let largest = i;
            let l = 2 * i + 1;
            let r = 2 * i + 2;
    
            if (l < n && arr[l] > arr[largest]) {
                tempAnimations.push([l, largest]);
                tempAnimations.push([l, arr[largest]]);
                tempAnimations.push([largest, arr[l]]);
                largest = l;
            }
                
            if (r < n && arr[r] > arr[largest]) {
                tempAnimations.push([r, largest]);
                tempAnimations.push([r, arr[largest]]);
                tempAnimations.push([largest, arr[r]]);
                largest = r;
            }    
    
            if (largest != i) {
                tempAnimations.push([i, largest]);
                tempAnimations.push([i, arr[largest]]);
                tempAnimations.push([largest, arr[i]]);
                [arr[i], arr[largest]] = [arr[largest], arr[i]];
    
                heapify(arr, n, largest);
            }
        }
    }

    function getMergeSortAnimations(arr) {
        arr = arr.slice();
        tempAnimations = [];
        getMergeSortAnimations2(arr);


        function getMergeSortAnimations2(array) {
            if (array.length <= 1) return array;
            const auxiliaryArray = array.slice();
            mergeSortHelper(array, 0, array.length - 1, auxiliaryArray);
            setMergeSortAnimations(tempAnimations);
          }
          
          function mergeSortHelper(
            mainArray,
            startIndex,
            endIndex,
            auxiliaryArray,
          ) {
            if (startIndex === endIndex) return;
            const middleIndex = Math.floor((startIndex + endIndex) / 2);
            mergeSortHelper(auxiliaryArray, startIndex, middleIndex, mainArray);
            mergeSortHelper(auxiliaryArray, middleIndex + 1, endIndex, mainArray);
            doMerge(mainArray, startIndex, middleIndex, endIndex, auxiliaryArray);
          }
          
          function doMerge(
            mainArray,
            startIndex,
            middleIndex,
            endIndex,
            auxiliaryArray,
          ) {
            let k = startIndex;
            let i = startIndex;
            let j = middleIndex + 1;
            while (i <= middleIndex && j <= endIndex) {
              //animations.push([i, j]);
              tempAnimations.push([i, j]);
              if (auxiliaryArray[i] <= auxiliaryArray[j]) {
                tempAnimations.push([k, auxiliaryArray[i]]);
                tempAnimations.push([k, auxiliaryArray[i]]);
                mainArray[k++] = auxiliaryArray[i++];
              } else {
                tempAnimations.push([k, auxiliaryArray[j]]);
                tempAnimations.push([k, auxiliaryArray[j]]);
                mainArray[k++] = auxiliaryArray[j++];
              }
            }
            while (i <= middleIndex) {
              //animations.push([i, i]);
              tempAnimations.push([i, i]);
              tempAnimations.push([k, auxiliaryArray[i]]);
              tempAnimations.push([k, auxiliaryArray[i]]);
              mainArray[k++] = auxiliaryArray[i++];
            }
            while (j <= endIndex) {
              //animations.push([j, j]);
              tempAnimations.push([j, j]);
              tempAnimations.push([k, auxiliaryArray[j]]);
              tempAnimations.push([k, auxiliaryArray[j]]);
              mainArray[k++] = auxiliaryArray[j++];
            }
          }
    }

    function getBubbleSortAnimations(arr) {
        tempAnimations = [];
        arr = arr.slice();
        getBubbleSortAnimations2(arr);

        function getBubbleSortAnimations2(arr) {
            if (arr.length <= 1) return arr;
            bubbleSort(arr);
            setHeapSortAnimations(tempAnimations);
        }
        
        function bubbleSort(arr) {
            let startIndex = 1;
            let justCheated = false;
            for (let i = 0; i < arr.length; i++) {
                if (!justCheated) startIndex = 1;
                let largestValue = arr[startIndex - 1];
                for (let j = startIndex; j < arr.length - i; j++) {
                    if (j - 1 !== -1) {
                        tempAnimations.push([j - 1, j]);
                    }
                    if (arr[j] > largestValue) {
                        largestValue = arr[j];
                        
                        if (!justCheated) startIndex = j - 1;
        
                        tempAnimations.push([j, largestValue]);
                        tempAnimations.push([j - 1, arr[j - 1]]);
                    } else {
                        if (j - 1 !== -1) {
                            tempAnimations.push([j, arr[j - 1]]);
                            tempAnimations.push([j - 1, arr[j]]);
                            // swap indices
                            [arr[j - 1], arr[j]] = [arr[j], arr[j - 1]];
                        }               
                    }
                }
                justCheated = !justCheated;
            }
        }
    }





}