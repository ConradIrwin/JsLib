describe("String", function() {

	describe("capitalize", function() {
		it("returns the string unaltered if already capitalized", function() {
			expect("Foo".capitalize()).toEqual("Foo");
		});

		it("makes the first letter upper-case", function() {
			expect("foo".capitalize()).toEqual("Foo");
		});

		it("does not alter strings that do not begin with letters", function() {
			expect("123 abc".capitalize()).toEqual("123 abc");
		});

		it("Capitalizes the first letter of the first line", function() {
			expect("line 1\nline 2".capitalize()).toEqual("Line 1\nline 2");
		});
	});

	describe("singularize", function() {
		it("drops the s when the string ends with a consonant, followed by 's'", function() {
			expect("sails".singularize()).toEqual("sail");
		});
		it("converts 'es' to e", function() {
			expect("sales".singularize()).toEqual("sale");
		});
		it("changes 'ies' to 'y'", function() {
			expect("dailies".singularize()).toEqual("daily");
		});
	});

	describe("toClassName", function() {
		it("converts a non name space string to a class name", function() {
			expect("foo".toClassName()).toEqual("Foo");
			expect("foo_bar".toClassName()).toEqual("FooBar");
		});

		it("converts a namespaced string to a namespaced class name", function() {
			expect("foo-bar".toClassName()).toEqual("foo.Bar");
			expect("foo-bar-baz-bee_bop".toClassName()).toEqual("foo.bar.baz.BeeBop");
		});
	});

});
