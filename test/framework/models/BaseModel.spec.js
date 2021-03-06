describe("BaseModel", function() {

	describe("includeModule", function() {
		it("extends the prototype of BaseModel", function() {
			var module = {
				prototype: {
					foo: function() {
						return 'bar';
					}
				}
			};
			BaseModel.includeModule("__TEST__", module);
			expect(BaseModel.prototype.hasOwnProperty('foo')).toBeTrue();
			expect(BaseModel.prototype.foo).toEqual(module.prototype.foo);
			expect(BaseModel.prototype.foo()).toEqual('bar');
		});

		it("overrides existing methods or properties in the BaseModel prototype", function() {
			var module = {
				prototype: {
					foo: function() {
						return 'foo';
					}
				}
			};
			BaseModel.includeModule("__TEST2__", true, module);
			expect(BaseModel.prototype.foo).toEqual(module.prototype.foo);
			expect(BaseModel.prototype.foo()).toEqual('foo');
		});

		it("adds callbacks around method calls", function() {
			var module = {
				callbacks: {
					foo: function() {
						return 'foo';
					}
				}
			};
			BaseModel.includeModule("__TEST3__", module);
			expect(BaseModel.moduleCallbacks.hasOwnProperty("foo")).toBeTrue();
			expect(BaseModel.moduleCallbacks.foo).toBeInstanceof(Array);
			expect(BaseModel.moduleCallbacks.foo.length).toEqual(1);
		});
	});

	describe("extendModule", function() {
		it("extends the BaseModel prototype if the module exists", function() {
			var module = {
				prototype: {
					getAbc: function() {
						return '123';
					}
				}
			};
			var extension = {
				prototype: {
					getAbc123: function() {
						return 'abc123';
					},
					getAbc: function() {
						return 'abc';
					}
				}
			};
			BaseModel.includeModule("__TEST4__", module);
			BaseModel.extendModule("__TEST4__", extension);
			expect(BaseModel.prototype.hasOwnProperty("getAbc123")).toBeTrue();
			expect(BaseModel.prototype.getAbc123).toEqual(extension.prototype.getAbc123);
			expect(BaseModel.prototype.getAbc).toNotEqual(extension.prototype.getAbc);
			expect(BaseModel.prototype.getAbc()).toEqual("123");
		});

		it("throws an error if the module has not been included", function() {
			expect(function() {
				BaseModel.extendModule("__NON_EXISTENT_MODULE__", {});
			}).toThrowError();
		});

		it("overrides methods or properties on the BaseModel prototype", function() {
			var module = {
				prototype: {
					overrideMe: function() {
						return '123';
					}
				}
			};
			var extension = {
				prototype: {
					overrideMe: function() {
						return 'abc';
					}
				}
			};
			BaseModel.includeModule("__TEST5__", module);
			BaseModel.extendModule("__TEST5__", true, extension);
			expect(BaseModel.prototype.overrideMe).toEqual(extension.prototype.overrideMe);
			expect(BaseModel.prototype.overrideMe()).toEqual("abc");
		});
	});

	describe("applyModuleCallbacks", function() {
		xit("should be tested");
	});

	it("defines a primary key by default", function() {
		var o = new TestModel();
		expect(o.isValidAttributeKey("id")).toEqual(true);
		expect(o.id).toBeNull();
	});

	it("allows sub classes to override the primary key", function() {
		var o = new TestModelPrimaryKeyOverride();
		expect(o.isValidAttributeKey("foo_id")).toEqual(true);
		expect(o.foo_id).toBeNull();
	});

	it("sets newRecord to true when instantiated with no primary key", function() {
		var model = new TestModelAttributes();
		expect(model.newRecord).toBeTrue();
	});

	describe("getAttribute", function() {
		beforeEach(function() {
			this.model = new TestModelAttributes();
		});

		it("returns null when the key is undefined", function() {
			expect(this.model.firstName).toBeNull();
		});

		it("returns null when the key is null", function() {
			this.model.firstName = null;
			expect(this.model.firstName).toBeNull();
		});

		it("returns the attribute value at the given key", function() {
			this.model.firstName = "Joe";
			expect(this.model.firstName).toEqual("Joe");
		});
	});

	describe("setAttribute", function() {
		beforeEach(function() {
			this.model = new TestModelAttributes();
		});

		it("sets a null value", function() {
			this.model.setAttribute("firstName", null);
			expect(this.model.getAttribute("firstName")).toBeNull();
			expect(this.model.changedAttributes.firstName).toBeUndefined();
		});

		it("sets a non null value", function() {
			this.model.setAttribute("firstName", "Joey");
			expect(this.model.getAttribute("firstName")).toEqual("Joey");
			expect(this.model.changedAttributes.firstName).toBeUndefined();
		});

		it("sets the changed attributes for non null values", function() {
			this.model.setAttribute("firstName", "Joey");
			this.model.setAttribute("firstName", "Eddy");
			expect(this.model.getAttribute("firstName")).toEqual("Eddy");
			expect(this.model.changedAttributes.firstName).toEqual("Joey");
		});

		it("sets the changed attributes to null", function() {
			this.model.setAttribute("firstName", null);
			this.model.setAttribute("firstName", "Billy");
			expect(this.model.changedAttributes.firstName).toBeNull();
		});

		it("publishes attribute:<key>:changed", function() {
			spyOn(this.model, "publish");
			this.model.setAttribute("firstName", "Bob");
			this.model.setAttribute("firstName", "Jane");
			expect(this.model.publish).toHaveBeenCalledWith("attribute:firstName:changed");
		});

		it("sets newRecord to false when setting the primary key for the first time", function() {
			expect(this.model.newRecord).toBeTrue();
			this.model.setAttribute("id", 1234);
			expect(this.model.newRecord).toBeFalse();
		});
	});

	describe("valueIsEmpty", function() {
		beforeEach(function() {
			this.model = new TestModel();
		});

		it("returns true for null values", function() {
			expect(this.model.valueIsEmpty(null)).toEqual(true);
		});

		it("returns true for undefined values", function() {
			var foo;
			expect(this.model.valueIsEmpty(foo)).toEqual(true);
		});

		it("returns false for NaN values", function() {
			expect(this.model.valueIsEmpty(NaN)).toBeFalse();
		});

		it("returns true for empty strings", function() {
			expect(this.model.valueIsEmpty("")).toEqual(true);
		});

		it("returns true for strings containing only white space characters", function() {
			expect(this.model.valueIsEmpty("	\t	")).toEqual(true);
		});

		it("returns true for empty arrays", function() {
			expect(this.model.valueIsEmpty( [] )).toEqual(true);
		});

		it("returns false for everything else", function() {
			expect(this.model.valueIsEmpty( "abc" )).toEqual(false);
			expect(this.model.valueIsEmpty( 0 )).toEqual(false);
			expect(this.model.valueIsEmpty( -1 )).toEqual(false);
			expect(this.model.valueIsEmpty( 1 )).toEqual(false);
			expect(this.model.valueIsEmpty( {} )).toEqual(false);
			expect(this.model.valueIsEmpty( function() {} )).toEqual(false);
			expect(this.model.valueIsEmpty( true )).toEqual(false);
			expect(this.model.valueIsEmpty( false )).toEqual(false);
		});
	});

	describe("valid attributes", function() {
		it("returns false for invalid attributes", function() {
			var o = new TestModelAttributes();
			expect(o.isValidAttributeKey("non_existent")).toEqual(false);
			expect(o.isValidAttributeKey("Name")).toEqual(false);
		});

		it("returns true for valid attributes", function() {
			var o = new TestModelAttributes();
			expect(o.isValidAttributeKey("firstName")).toEqual(true);
			expect(o.isValidAttributeKey("lastName")).toEqual(true);
			expect(o.isValidAttributeKey("id")).toEqual(true);
		});
	});

	describe("constructor", function() {
		it("assigns attributes", function() {
			var o = new TestModelAttributes({id: 123, firstName: "John", lastName: "Doe"});
			expect(o.id).toEqual(123);
			expect(o.firstName).toEqual("John");
			expect(o.lastName).toEqual("Doe");
		});

		it("ignores invalid attributes", function() {
			var o = new TestModelAttributes({id: 123, invalidAttr: "foo"});
			expect(o.hasOwnProperty("invalidAttr")).toEqual(false);
			expect(o.invalidAttr).toBeUndefined();
		});

		it("does not require attributes", function() {
			expect(function() {
				var o = new TestModelAttributes();
			}).not.toThrow(Error);
		});
	});

	describe("attributes", function() {

		describe("getters", function() {
			it("return null when no attribute was given", function() {
				var o = new TestModelAttributes();
				expect(o.id).toBeNull();
				expect(o.firstName).toBeNull();
				expect(o.lastName).toBeNull();
			});

			it("return the value", function() {
				var o = new TestModelAttributes({id: 123});
				expect(o.id).toEqual(123);
				expect(o.firstName).toBeNull();
				expect(o.lastName).toBeNull();

			});
		});

		describe("setters", function() {
			it("put entries in the changedAttributes", function() {
				var o = new TestModelAttributes({firstName: "Fred"});
				expect(o.changedAttributes.id).toBeUndefined();
				expect(o.changedAttributes.firstName).toBeUndefined();
				o.id = 123;
				o.firstName = "Joe";
				expect(o.id).toEqual(123);
				expect(o.firstName).toEqual("Joe");
				expect(o.changedAttributes.id).toBeUndefined();
				expect(o.changedAttributes.firstName).toEqual("Fred");
			});
		});

		it("publishes attributes:changed", function() {
			var o = new TestModelAttributes();
			spyOn(o, "publish");
			o.attributes = {firstName: "Joey"};
			expect(o.publish).wasNotCalled();
			o.attributes = {firstName: "Billy"};
			expect(o.publish).toHaveBeenCalledWith("attribute:firstName:changed");
			expect(o.publish).toHaveBeenCalledWith("attributes:changed");
		});

		it("sets newRecord to false when the primary key is added", function() {
			var o = new TestModelAttributes();
			expect(o.newRecord).toBeTrue();
			o.attributes = {id: 1234};
			expect(o.newRecord).toBeFalse();
		});
	});

	describe("destroy", function() {
		beforeEach(function() {
			this.model = new TestModelAttributes();
		});

		it("sets the destroyed flag to true", function() {
			this.model.destroy();
			expect(this.model.destroyed).toBeTrue();
		});

		it("publishes the destroyed event", function() {
			spyOn(this.model, "publish");
			this.model.destroy();
			this.model.destroy();
			expect(this.model.publish).wasCalledWith("destroyed");
			expect(this.model.publish.callCount).toEqual(1);
		});

		it("applies module callbacks", function() {
			spyOn(this.model, "applyModuleCallbacks");
			this.model.destroy();
			expect(this.model.applyModuleCallbacks).toHaveBeenCalledWith("destroy", []);
		});
	});

	describe("save", function() {
		beforeEach(function() {
			this.model = new TestModelAttributes();
		});

		it("publishes the created event", function() {
			this.model.attributes = {firstName: "Jane", lastName: "McJanerson"};
			spyOn(this.model, "publish");
			expect(this.model.newRecord).toBeTrue();
			this.model.save();
			expect(this.model.publish).toHaveBeenCalledWith("created");
			expect(this.model.newRecord).toBeFalse();
		});

		it("publishes the updated event", function() {
			this.model.attributes = {firstName: "Jane", lastName: "McJanerson", id: 1234};
			spyOn(this.model, "publish");
			expect(this.model.newRecord).toBeFalse();
			this.model.save();
			expect(this.model.publish).toHaveBeenCalledWith("updated");
			expect(this.model.newRecord).toBeFalse();
		});

		it("sets newRecord to false", function() {
			this.model.attributes = {firstName: "Abby"};
			expect(this.model.newRecord).toBeTrue();
			this.model.save();
			expect(this.model.newRecord).toBeFalse();
		});
	});

	describe("subscribe", function() {
		beforeEach(function() {
			this.model = new TestModelAttributes();
		});

		it("accepts an event name and a callback function", function() {
			var subscriber = {
				callback: function(model) {
					
				}
			};
			spyOn(subscriber, "callback");
			this.model.subscribe("test", subscriber.callback);
			this.model.publish("test");
			expect(subscriber.callback).toHaveBeenCalledWith(this.model);
		});

		it("accepts an event name, an object context and callback function", function() {
			var called = false;
			var subscriber = {
				callback: function(model) {
					called = true;
					expect(this).toEqual(subscriber);
				}
			};
			this.model.subscribe("test", subscriber, subscriber.callback);
			this.model.publish("test");
			expect(called).toBeTrue();
		});

		it("accepts an event name, an object, and the name of a method to call", function() {
			var called = false;
			var subscriber = {
				callback: function(model) {
					
				}
			};
			spyOn(subscriber, "callback");
			this.model.subscribe("test", subscriber, "callback");
			this.model.publish("test");
			expect(subscriber.callback).toHaveBeenCalledWith(this.model);
		});

		it("allows the same subscriber to subscribe more than once", function() {
			var subscriber = {
				callback: function() {
					
				}
			};
			spyOn(subscriber, "callback");
			this.model.subscribe("test", subscriber, "callback");
			this.model.subscribe("test", subscriber, "callback");
			this.model.publish("test");
			expect(subscriber.callback.callCount).toEqual(2);
		});
	});

	describe("unsubscribe", function() {
		beforeEach(function() {
			this.model = new TestModelAttributes();
		});

		it("removes a subscriber matching event name and callback function", function() {
			var callback = function() {};
			this.model.subscribe("test", callback);
			expect(this.model.subscribers.test.length).toEqual(1);
			this.model.unsubscribe("test", callback);
			expect(this.model.subscribers.test.length).toEqual(0);
		});

		it("removes a subscriber matching event name, object instance, and callback function", function() {
			var subscriber = {
				callback: function() {}
			};
			this.model.subscribe("test", subscriber, subscriber.callback);
			expect(this.model.subscribers.test.length).toEqual(1);
			this.model.unsubscribe("test", subscriber, subscriber.callback);
			expect(this.model.subscribers.test.length).toEqual(0);
		});

		it("removes a subscriber matching event name, object instance and callback method name", function() {
			var subscriber = {
				callback: function() {}
			};
			this.model.subscribe("test", subscriber, "callback");
			expect(this.model.subscribers.test.length).toEqual(1);
			this.model.unsubscribe("test", subscriber, "callback");
			expect(this.model.subscribers.test.length).toEqual(0);
		});

		it("throws an error if an object is passed, but no callback", function() {
			var subscriber = {
				callback: function() {}
			};
			var model = this.model;
			this.model.subscribe("test", subscriber, "callback");
			expect(function() {
				model.unsubscribe("test", subscriber);
			}).toThrowError();
		});
	});

});
