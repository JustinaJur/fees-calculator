const express = require("express");
const axios = require("axios");
const moment = require("moment");
const { groupBy } = require("lodash");

const app = express();

countCashIn = item => {
  const fee = (item * 0.03) / 100;
  const finalFee =
    fee > 5 ? (5).toFixed(2) : Math.ceil(fee.toFixed(3) * 100) / 100;
  console.log(finalFee);
};

countCashOut = (amount, userType) => {
  let fee = (amount * 0.3) / 100;
  if (userType === "juridical") {
    console.log((fee = fee < 0.5 ? (0.5).toFixed(2) : fee.toFixed(2)));
  } else console.log(fee.toFixed(2));
};

addWeekData = users => {
  Object.keys(users).forEach(userId => {
    users[userId].map(obj => {
      return (obj.week =
        moment(obj.date).year() + "-" + moment(obj.date).isoWeek());
    });
  });
  return users;
};

countFees = data => {
  const rest = [];
  const restGroupedByWeeks = [];

  data.filter(item => {
    const amount = item.operation.amount;
    const userType = item.user_type;

    if (item.type === "cash_in") {
      countCashIn(amount);
    } else if (item.type === "cash_out" && item.user_type === "juridical") {
      countCashOut(amount, userType);
    } else rest.push(item);
  });

  const usersById = groupBy(rest, operation => operation.user_id);
  const usersWithWeekData = addWeekData(usersById);

  Object.keys(usersWithWeekData).forEach(week => {
    const userByWeeks = groupBy(
      usersWithWeekData[week],
      operation => operation.week
    );
    restGroupedByWeeks.push(userByWeeks);
  });

  for (let prop in restGroupedByWeeks) {
    for (let property in restGroupedByWeeks[prop]) {
      restGroupedByWeeks[prop][property].reduce((sum, cur) => {
        const userType = cur.user_type;

        sum = sum + cur.operation.amount;
        let amount =
          cur.operation.amount > 1000
            ? cur.operation.amount - 1000
            : cur.operation.amount;

        sum > 1000
          ? countCashOut(amount, userType)
          : console.log((0.0).toFixed(2));
        return sum;
      }, 0);
    }
  }
};

axios
  .get(process.argv[2])
  .then(response => {
    countFees(response.data);
  })
  .catch(error => {
    console.log(error);
  });

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => console.log(`running on ${PORT}`));
