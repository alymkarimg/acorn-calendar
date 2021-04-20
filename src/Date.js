// alter prototypes
Date.prototype.addDays = function (days) {
    return new Date().getDate() + days;
};

Date.prototype.getStartOfWeek = (d = new Date().toUTCString()) => {
    d = new Date(d);
    var day = d.getDay(),
        diff = d.getDate() - day + (day == 0 ? -6 : 1); // adjust when day is sunday
    return new Date(d.setDate(diff));
};