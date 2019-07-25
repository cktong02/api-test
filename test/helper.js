var supertest = require("supertest");
var should = require("should");
var env = require("../env")
var server = supertest.agent(env.orderEndpint);

exports.orderType = {
    STANDARD: "standard",
    LATE_NIGHT: "late night"
}

exports.place3StopsOrder = (orderTime) => {
    var input = {
        stops: [{
            "lat": 22.344674, "lng": 114.124651
        },
        {
            "lat": 22.375384, "lng": 114.182446
        },
        {
            "lat": 22.385669, "lng": 114.186962
        }]
    };

    if (orderTime) {
        var apiOrderTime = new Date(orderTime);
        var offset = apiOrderTime.getTimezoneOffset() / 60;
        apiOrderTime.setHours(apiOrderTime.getHours() - offset);
        input.orderAt = apiOrderTime.toISOString();
    }

    return server.post("/orders")
        .send(input)
        .set("Accept", "application/json");
}

exports.getStandardTripFare = (drivingDistances) => getTotalTripFare(drivingDistances, env.first2kmStandardFare, env.every200mStandardFare);

exports.getLateNightTripFare = (drivingDistances) => getTotalTripFare(drivingDistances, env.first2kmLateNightFare, env.every200mLateNightFare);

function getTotalTripFare(drivingDistances, first2kmFare, every200mFare) {
    var totalDistance = drivingDistances.reduce((a, b) => a + b, 0);
    if (drivingDistances <= 2000) {
        return first2kmFare;
    }
    else {
        return Number((first2kmFare + (totalDistance - 2000) / 200 * every200mFare).toFixed(2));
    }
}

exports.shouldReturnOrderNotFoundError = (testRequest, done) => {
    testRequest.expect(404)
        .end(function (err, res) {
            res.status.should.equal(404);
            res.body.message.should.equal("ORDER_NOT_FOUND");
            done();
        })
}

exports.shouldReturnViolatedLogicFlowError = (testRequest, expectedMessage, done) => {
    testRequest.expect(422)
        .end(function (err, res) {
            res.status.should.equal(422);
            res.body.message.should.equal(expectedMessage);
            done();
        });
}