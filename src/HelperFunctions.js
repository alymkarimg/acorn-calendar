export const formatEndTime = (startTime) => {
    switch (startTime) {
        case "time-0900":
            return "time-0930";
        case "time-0930":
            return "time-1000";
        case "time-1000":
            return "time-1030";
        case "time-1030":
            return "time-1100";
        case "time-1100":
            return "time-1130";
        case "time-1130":
            return "time-1200";
        case "time-1200":
            return "time-1230";
        case "time-1230":
            return "time-1300";
        case "time-1300":
            return "time-1330";
        case "time-1330":
            return "time-1400";
        case "time-1400":
            return "time-1430";
        case "time-1430":
            return "time-1500";
        case "time-1500":
            return "time-1530";
        case "time-1530":
            return "time-1600";
        case "time-1600":
            return "time-1630";
        case "time-1630":
            return "time-1700";
        default:
            return "time-1730";
    }
};

export const convertTimestoDatetimes = (time) => {
    switch (time) {
        case "time-0900":
            return new Date("Tue Apr 20 2021 09:00:00 GMT+0100");
        case "time-0930":
            return new Date("Tue Apr 20 2021 09:30:00 GMT+0100");
        case "time-1000":
            return new Date("Tue Apr 20 2021 10:00:00 GMT+0100");
        case "time-1030":
            return new Date("Tue Apr 20 2021 10:30:00 GMT+0100");
        case "time-1100":
            return new Date("Tue Apr 20 2021 11:00:00 GMT+0100");
        case "time-1130":
            return new Date("Tue Apr 20 2021 11:30:00 GMT+0100");
        case "time-1200":
            return new Date("Tue Apr 20 2021 12:00:00 GMT+0100");
        case "time-1230":
            return new Date("Tue Apr 20 2021 12:30:00 GMT+0100");
        case "time-1300":
            return new Date("Tue Apr 20 2021 13:00:00 GMT+0100");
        case "time-1330":
            return new Date("Tue Apr 20 2021 13:30:00 GMT+0100");
        case "time-1400":
            return new Date("Tue Apr 20 2021 14:00:00 GMT+0100");
        case "time-1430":
            return new Date("Tue Apr 20 2021 14:30:00 GMT+0100");
        case "time-1500":
            return new Date("Tue Apr 20 2021 15:00:00 GMT+0100");
        case "time-1530":
            return new Date("Tue Apr 20 2021 15:30:00 GMT+0100");
        case "time-1600":
            return new Date("Tue Apr 20 2021 16:00:00 GMT+0100");
        case "time-1630":
            return new Date("Tue Apr 20 2021 16:30:00 GMT+0100");
        case "time-1700":
            return new Date("Tue Apr 20 2021 17:00:00 GMT+0100");
        default:
            return new Date("Tue Apr 20 2021 17:30:00 GMT+0100");
    }
}

export const getWeek = (dt) => {
    dt = new Date(dt)
    
    function findMonday(dt) {
        while (dt.getDay() != 1) {
            dt.setDate(dt.getDate() - 1);
        }
        return dt;
    }

    const firstDayOfTheWeek = findMonday(dt);

    let arr = [];
    for (var i = 0; i < 7; i++) {
        var next = new Date(dt.getTime());
        next.setDate(dt.getDate() + i);
        arr.push(next);
    }

    console.log(arr, firstDayOfTheWeek);
    return arr;
};

export const validateStartAndEndTimes = (event) => {
    var values = {
        time0900: 1,
        time0930: 2,
        time1000: 3,
        time1030: 4,
        time1030: 5,
        time1100: 6,
        time1130: 7,
        time1200: 8,
        time1230: 9,
        time1300: 10,
        time1330: 11,
        time1400: 12,
        time1430: 13,
        time1500: 14,
        time1530: 15,
        time1600: 16,
        time1630: 17,
        time1700: 18,
        time1730: 19
    }

    const removeHyphen = (str) => {
        return str.split('-').join('');
    }

    let a = values[removeHyphen(event.start)];
    let b = values[removeHyphen(event.end)];

    return a >= b ? false : true
}