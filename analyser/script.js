class SortingVisualizer {
    constructor() {
        this.array = [];
        this.arrayContainer = document.getElementById('array-container');
        this.size = document.getElementById('size');
        this.speed = document.getElementById('speed');
        this.algorithm = document.getElementById('algorithm');
        
        this.initializeEventListeners();
        this.generateArray();
    }

    initializeEventListeners() {
        document.getElementById('generate').addEventListener('click', () => this.generateArray());
        document.getElementById('sort').addEventListener('click', () => this.startSort());
        this.size.addEventListener('input', () => this.generateArray());
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
                    let temp = this.array[j];
                    this.array[j] = this.array[j+1];
                    this.array[j+1] = temp;
                    this.displayArray();
                }
                
                bars[j].classList.remove('comparing');
                bars[j+1].classList.remove('comparing');
            }
            bars[this.array.length-i-1].classList.add('sorted');
        }
    }

    // Add other sorting algorithms similarly...
}

// Initialize the visualizer when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new SortingVisualizer();
});