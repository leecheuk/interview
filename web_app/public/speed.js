class Speed {
    constructor(val) {
        this.val = parseFloat(val);
    }
    toString() {
        if (this.val * 10 ** -6 >= 1) {
            return `${(this.val * 10 ** -6).toFixed(2)} KB/s`;
        } else if (this.val * 10 ** -3 >= 1) {
            return `${(this.val * 10 ** -3).toFixed(2)} KB/s`;
        } else {
            return `${(this.val).toFixed(2)} B/s`;
        }
    }
    get value() {
        return this.val;
    }
}

export default Speed;