class SortingVisualizer {
    constructor() {
        this.array = [];
        this.arrayContainer = document.getElementById('array-container');
        this.size = document.getElementById('size');
        this.speed = document.getElementById('speed');
        this.algorithm = document.getElementById('algorithm');
        this.definitionText = document.getElementById('definition-text');
        this.complexityText = document.getElementById('complexity-text');


        this.algorithmDefinitions = {
            bubble: {
                definition: "Bubble Sort is a simple comparison-based algorithm that repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order. Elements 'bubble' to their correct position.",
                complexity: "Worst and Average Case: O(n²), Best Case: O(n)"
            },
            insertion: {
                definition: "Insertion Sort builds the final sorted array one item at a time. It is efficient for small datasets and nearly sorted data.",
                complexity: "Worst and Average Case: O(n²), Best Case: O(n)"
            },
            selection: {
                definition: "Selection Sort repeatedly finds the minimum element from the unsorted part and places it at the beginning. Simple to implement but not efficient for large lists.",
                complexity: "Worst, Average, and Best Case: O(n²)"
            },
            quick: {
                definition: "Quick Sort is a divide-and-conquer algorithm. It selects a 'pivot' and partitions the array around it, then recursively sorts subarrays. Very efficient on average.",
                complexity: "Worst Case: O(n²), Average Case: O(n log n), Best Case: O(n log n)"
            },
            merge: {
                definition: "Merge Sort is a divide-and-conquer, efficient, stable sort. It divides the array into halves, sorts them recursively, and then merges the sorted halves.",
                complexity: "Worst, Average, and Best Case: O(n log n)"
            }
        };


        this.initializeEventListeners();
        this.generateArray();
        this.updateAlgorithmInfo(this.algorithm.value); // Initial definition display
    }

    initializeEventListeners() {
        document.getElementById('generate').addEventListener('click', () => this.generateArray());
        document.getElementById('sort').addEventListener('click', () => this.startSort());
        this.size.addEventListener('input', () => this.generateArray());
        this.algorithm.addEventListener('change', (event) => this.updateAlgorithmInfo(event.target.value));
    }

    generateArray() {
        this.array = [];
        for(let i = 0; i < this.size.value; i++) {
            this.array.push(Math.random() * 100);
        }
        this.displayArray();
    }

    displayArray() {
        this.arrayContainer.innerHTML = '';
        const maxVal = Math.max(...this.array);
        const width = 100 / this.array.length;

        this.array.forEach(value => {
            const bar = document.createElement('div');
            bar.className = 'array-bar';
            bar.style.height = `${(value/maxVal) * 100}%`;
            bar.style.width = `${width}%`;
            this.arrayContainer.appendChild(bar);
        });
    }

    updateAlgorithmInfo(algorithmName) {
        if (this.algorithmDefinitions[algorithmName]) {
            this.definitionText.textContent = this.algorithmDefinitions[algorithmName].definition;
            this.complexityText.textContent = "Time Complexity: " + this.algorithmDefinitions[algorithmName].complexity;
        } else {
            this.definitionText.textContent = "Select an algorithm from the dropdown to view its definition.";
            this.complexityText.textContent = "Time complexity will be displayed here after algorithm selection.";
        }
    }


    async startSort() {
        const bars = document.getElementsByClassName('array-bar');
        switch(this.algorithm.value) {
            case 'bubble':
                await this.bubbleSort(bars);
                break;
            case 'insertion':
                await this.insertionSort(bars);
                break;
            case 'selection':
                await this.selectionSort(bars);
                break;
            case 'quick':
                await this.quickSort(bars, 0, this.array.length - 1);
                break;
            case 'merge':
                await this.mergeSort(bars, 0, this.array.length - 1);
                break;
        }
        this.finalizeSort(bars);
    }

    finalizeSort(bars) {
        for (let i = 0; i < bars.length; i++) {
            bars[i].classList.add('sorted');
        }
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async bubbleSort(bars) {
        for(let i = 0; i < this.array.length; i++) {
            for(let j = 0; j < this.array.length - i - 1; j++) {
                bars[j].classList.add('comparing');
                bars[j+1].classList.add('comparing');
                await this.sleep(100 - this.speed.value);

                if(this.array[j] > this.array[j+1]) {
                    await this.swap(j, j+1, bars);
                }

                bars[j].classList.remove('comparing');
                bars[j+1].classList.remove('comparing');
            }
            bars[this.array.length-i-1].classList.add('sorted');
        }
    }

    async insertionSort(bars) {
        for (let i = 1; i < this.array.length; i++) {
            let key = this.array[i];
            let j = i - 1;
            bars[i].classList.add('comparing');

            while (j >= 0 && this.array[j] > key) {
                bars[j].classList.add('comparing');
                bars[j+1].classList.add('shifting');

                await this.sleep(100 - this.speed.value);
                await this.swap(j, j+1, bars);


                bars[j].classList.remove('comparing');
                bars[j+1].classList.remove('shifting');
                j = j - 1;
            }
            this.array[j + 1] = key;
            this.displayArray();
            bars[i].classList.remove('comparing');
            bars[i].classList.add('sorted'); // Mark current element as sorted after inner loop
        }
    }

    async selectionSort(bars) {
        for (let i = 0; i < this.array.length - 1; i++) {
            let minIndex = i;
            bars[i].classList.add('comparing');

            for (let j = i + 1; j < this.array.length; j++) {
                bars[j].classList.add('comparing');
                await this.sleep(100 - this.speed.value);

                if (this.array[j] < this.array[minIndex]) {
                    if (minIndex !== i) {
                        bars[minIndex].classList.remove('comparing');
                    }
                    minIndex = j;
                    bars[minIndex].classList.add('comparing');
                } else {
                    bars[j].classList.remove('comparing');
                }
            }
            await this.swap(i, minIndex, bars);
            bars[minIndex].classList.remove('comparing');
            bars[i].classList.add('sorted');
        }
         bars[this.array.length-1].classList.add('sorted'); // Last element is also sorted
    }


    async quickSort(bars, low, high) {
        if (low < high) {
            let pi = await this.partition(bars, low, high);

            await Promise.all([
                this.quickSort(bars, low, pi - 1),
                this.quickSort(bars, pi + 1, high)
            ]);
        } else if (low >= 0 && high >= 0 && low < this.array.length && high < this.array.length) {
            bars[high].classList.add('sorted');
            bars[low].classList.add('sorted');
        }
    }

    async partition(bars, low, high) {
        let pivot = this.array[high];
        let i = (low - 1);

        bars[high].classList.add('pivot'); // Highlight pivot bar

        for (let j = low; j <= high - 1; j++) {
            bars[j].classList.add('comparing');
            await this.sleep(100 - this.speed.value);

            if (this.array[j] < pivot) {
                i++;
                await this.swap(i, j, bars);
            }
            bars[j].classList.remove('comparing');
        }
        await this.swap(i + 1, high, bars); // Place pivot in correct position

        bars[high].classList.remove('pivot'); // Remove pivot highlight
        bars[i + 1].classList.add('sorted'); // Mark pivot as sorted

        return (i + 1);
    }


    async mergeSort(bars, l, r) {
        if (l >= r) {
            return;
        }
        let m = l + Math.floor((r - l) / 2);
        await Promise.all([
            this.mergeSort(bars, l, m),
            this.mergeSort(bars, m + 1, r),
        ]);
        await this.merge(bars, l, m, r);
    }

    async merge(bars, l, m, r) {
        let n1 = m - l + 1;
        let n2 = r - m;

        let L = new Array(n1);
        let R = new Array(n2);

        for (let i = 0; i < n1; i++) {
            L[i] = this.array[l + i];
        }
        for (let j = 0; j < n2; j++) {
            R[j] = this.array[m + 1 + j];
        }

        let i = 0, j = 0, k = l;

        while (i < n1 && j < n2) {
            bars[l+i].classList.add('comparing');
            bars[m+1+j].classList.add('comparing');
            await this.sleep(100 - this.speed.value);


            if (L[i] <= R[j]) {
                this.array[k] = L[i];
                i++;
            } else {
                this.array[k] = R[j];
                j++;
            }
            this.displayArray(); // Update display after each comparison and placement
            bars[l+i-1 < 0 ? 0 : l+i-1].classList.remove('comparing'); // Avoid index out of bound
            bars[m+j].classList.remove('comparing');
            k++;
        }

        while (i < n1) {
            this.array[k] = L[i];
            i++;
            k++;
            this.displayArray();
        }

        while (j < n2) {
            this.array[k] = R[j];
            j++;
            k++;
            this.displayArray();
        }
    }


    async swap(i, j, bars) {
        await this.sleep(100 - this.speed.value); // Introduce delay before swap

        let temp = this.array[i];
        this.array[i] = this.array[j];
        this.array[j] = temp;
        this.displayArray();
    }
}

// Initialize the visualizer when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const visualizer = new SortingVisualizer();

    const sizeInput = document.getElementById('size');
    const sizeValueSpan = document.getElementById('size-value');
    const speedInput = document.getElementById('speed');
    const speedValueSpan = document.getElementById('speed-value');

    sizeInput.addEventListener('input', () => {
        sizeValueSpan.textContent = sizeInput.value;
        visualizer.generateArray(); // Regenerate array on size change
    });

    speedInput.addEventListener('input', () => {
        const speedValue = parseInt(speedInput.value);
        if (speedValue <= 30) {
            speedValueSpan.textContent = 'Fast';
        } else if (speedValue <= 70) {
            speedValueSpan.textContent = 'Medium';
        } else {
            speedValueSpan.textContent = 'Slow';
        }
    });
});