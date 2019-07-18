describe("Order Endpoints", function () {
    describe("Place Order", function () {
        describe("When stops are invalid", function () {
            it("should display missing stops error");
        });

        describe("When an order is placed at daytime", function () {
            it("should return new order with standard fare");
        });

        describe("When an order is placed at late night", function () {
            it("should return new order with extra fare");
        });

        describe("When an advance order is placed", function () {
            it("should return new order");
        });

        describe("When a past order is placed", function () {
            it("should display error");
        });
    });
});