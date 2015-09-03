var rack = {
    "name": "Blood 60 Rack",
    "sku": "234234234234",
    "barcode": "B234234",
    "rows": 6,
    "cols": 10,
};

var rows = 6;
var cols = 10;
var count = cols * rows;

var i = 0;
for (var r = 0; r < rows; r++) {
    for (c = 0; c < cols; c++) {
        process.stdout.write(i + "\t");
        i++;
    }
    process.stdout.write("\n");
}

