/**
 * CONVERSION FUNCTION
 * A conversion function to convert every integer in x to integer in y.
 * Assume x to be in range of 0 to 2^8-1, inclusive and y to be in range of 0 to 2^32-1. 
 * Output variable, y, must be same size as input variable, y.
 * 
 * @param {number[]} x - Array of numbers to be converted
 * @param {number} wl - One of the conversion factor
 * @param {number} ww - One of the conversion factor
 * @return {number[]} - Array of converted 
 */
function conversion(x, wl, ww) {
    let y = [];
    for (var i = 0; i < x.length; i++) {
        y[i] = 255/(1 + wl/ww*x[i]);
        if (x[i] < (ww - wl)/2) {
            y[i] = 0
        }
        if (x[i] > (ww + wl)/2) {
            y[i] = 255
        }
    }

    return y;
}

/**
 * OPTIMIZED CONVERSION FUNCTION 1
 * A conversion function to convert every integer in x to integer in y.
 * Assume x to be in range of 0 to 2^8-1, inclusive and y to be in range of 0 to 2^32-1. 
 * Output variable, y, must be same size as input variable, y.
 * 
 * More like increasing efficiency than reduce complexity
 * 
 * @param {number[]} x - Array of numbers to be converted
 * @param {number} wl - One of the conversion factor
 * @param {number} ww - One of the conversion factor
 * @return {number[]} - Array of converted 
 */
function optimizedConversion1(x, wl, ww) {
    let y = [];
    for (var i = 0; i < x.length; i++) {
        if (x[i] < (ww - wl)/2) {
            y[i] = 0;
        } else if (x[i] > (ww + wl)/2) {
            y[i] = 255;
        } else {
            y[i] = 255 / (1 + wl / ww * x[i]);
        }
    }

    return y;
}

/**
 * OPTIMIZED CONVERSION FUNCTION 2
 * A conversion function to convert every integer in x to integer in y.
 * Assume x to be in range of 0 to 2^8-1, inclusive and y to be in range of 0 to 2^32-1.
 * Output variable, y, must be same size as input variable, y.
 * 
 * ATTEMPTED OPTIMIZATION/EFFICIENCY: reduce loop count iteration; failed since x might not be sorted
 *
 * @param {number[]} x - Array of numbers to be converted
 * @param {number} wl - One of the conversion factor
 * @param {number} ww - One of the conversion factor
 * @return {number[]} - Array of converted
 */
function optimizedConversion2(x, wl, ww) {
    // sort input array x
    x = x.sort((a, b) => a - b); // <-- if x is sorted already, it helps reduce complexity

    // define 
    let upperBound = (ww + wl) / 2;
    let lowerBound = (ww - wl) / 2;

    // check where the lower & upper bound starts
    let lowerIndx = x.findIndex((val) => val >= lowerBound);
    let upperIndx = x.slice(lowerIndex, x.length).findIndex((val) => val <= upperBound); // <-- introduced additional loop, should get more insight in conversion factor 
                                                                                         // so you can arrive at a better estimate of upperBound index

    // segregate array by filling anything lower than lower bound with 0 
    // and guess the remainder to be 255 (reduce iteration count of anything larger than upper bound)
    let y = Array(x.length).fill(0, 0, lowerIndex).fill(255, lowerIndex, x.length);

    // loop through lower to upper cutoff points
    for (var i = lowerIndx; i <= upperIndx; i++) {
        y[i] = 255/(1 + wl/ww*x[i]);
    }

    return y;
}



/**
 * OPTIMIZED CONVERSION FUNCTION 3
 * A conversion function to convert every integer in x to integer in y.
 * Assume x to be in range of 0 to 2^8-1, inclusive and y to be in range of 0 to 2^32-1.
 * Output variable, y, must be same size as input variable, y.
 *
 * @param {number[]} x - Array of numbers to be converted
 * @param {number} wl - One of the conversion factor
 * @param {number} ww - One of the conversion factor
 * @return {number[]} - Array of converted
 */
function optimizedConversion3(x, wl, ww) {
    var conv = require("./conversion.json");
    // initialize with array all 0
    let y = Array(x.length).fill(0, 0, x.length); 
    let c = (wl/ww).toFixed(2).toString();
    let upperBound = (ww + wl) / 2;
    let lowerBound = (ww - wl) / 2;

    // assume x is sorted 
    // start from middle of array 
    let indx = Math.floor(x.length/2);
    y[indx] = conv[c][x[indx]];
    // spread to right side until you reach converted value (y_i) of 255, then convert all remaining to 255
    for (var j = indx; j < x.length; i++) {
        let inputX_R = x[j];
        if (inputX_R > upperBound) {
            y = y.fill(255, j, x.length);
            break;
        } else {
            let outputY_R = conv[c][inputX_R];
            y[i] = outputY_R;
        }
    }
    
    // spread to left side until you reach converted value (y_i) of 0
    for (var i = indx; i >= 0; i--) {
        let inputX_L = x[i];
        if (inputX_L < lowerBound) {
            break;
        } else {
            let outputY_L = conv[c][inputX_L];
            y[i] = outputY_L;
        }
    }

    return y;
}


const fs = require('fs');
/**
 * Create a nested dictionary that maps all possible x to y. Assume wl/ww belongs to 0 to 1, inclusively. 
 * Store dictionary in json for O(1) access. The key is conversion factor (wl/ww) and value is a dictionary
 * of values.
 * 
 * @return {void}
 */ 
function createDict() {
    let upperBound = 2**8-1;
    let json = {};

    // all possible conversion factors (wl/ww)
    for (var c = 0; c <= 1.01; c += 0.01) {
        let k = c.toFixed(2)
        json[k] = {};
        // all possible x values
        for (var x = 0; x <= upperBound; x++) {
            json[k][x] = 255 / (1 + c * x);
        }
    }
    fs.writeFileSync('conversion.json', JSON.stringify(json), (err) => {
        if (err) console.log('Error')
    });
}
createDict();

