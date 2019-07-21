var supertest = require("supertest");
var should = require("should");
var env = require("../env")
var server = supertest.agent(env.orderEndpint);

exports.orderType = {
    STANDARD: "standard",
    LATE_NIGHT: "late night"
}

exports.place3StopsOrder = () =>
    server.post("/orders")
        .send({
            stops: [{
                "lat": 22.344674, "lng": 114.124651
            },
            {
                "lat": 22.375384, "lng": 114.182446
            },
            {
                "lat": 22.385669, "lng": 114.186962
            }]
        })
        .set("Accept", "application/json");

exports.getStandardTripFare = (drivingDistances) => {
    var totalDistance = drivingDistances.reduce((a, b) => a + b, 0);
    if (drivingDistances <= 2000) {
        return env.frst2kmStandardFare;
    }
    else {
        return env.frst2kmStandardFare + Math.ceil((totalDistance - 2000) / 200) * env.every200mStandardFare;
    }
};

exports.getLateNightTripFare = (drivingDistances) => {
    var totalDistance = drivingDistances.reduce((a, b) => a + b, 0);
    if (drivingDistances <= 2000) {
        return env.frst2kmLateNightFare;
    }
    else {
        return env.frst2kmLateNightFare + Math.ceil((totalDistance - 2000) / 200) * env.every200mLateNightFare;
    }
};

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