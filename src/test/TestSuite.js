/**
 * @class This class manages a suite of related tests.
 *
 * @extends Object
 */
function TestSuite( testController, testFactory, id ) {
	this.constructor( testController, testFactory, id );
}

/** @lends TestSuite */
TestSuite.prototype = {
	
	setupCallback: function() {},
	
	teardownCallback: function() {},
	
	/**
	 * @constructs
	 *
	 * @param {Object} testController The test controller responsible for
	 *                                managing this test suite.
	 * @param {Object} testFactory The test factory
	 * @param {String} id The optional test suite Id
	 * @return {void}
	 */
	constructor: function( testController, testFactory, id ) {
		if ( !this.setTestController( testController ) ) {
			throw new Error( "TestSuite.prototype.constructor: Argument 1 must be an instance of a test controller." );
		}
		
		if ( !this.setTestFactory( testFactory ) ) {
			throw new Error( "TestSuite.prototype.constructor: Argument 2 must be an instance of a test factory." );
		}
		
		if ( !this.setId( id ) ) {
			this.setId( String( ( new Date() ).getTime() ) );
		}
		
		this.tests = [];
	},
	
	
	
	/**
	 * @property {String} Unique Id for this test suite
	 */
	id: null,
	
	/**
	 * Get the Id associated with this test suite.
	 *
	 * @param {void}
	 * @return {String}
	 */
	getId: function() {
		return this.id;
	},
	
	/**
	 * Sets the Id for this test suite.
	 *
	 * @param {String} id New Id for this test
	 * @return {Boolean} True if set successfully
	 */
	setId: function( id ) {
		if ( typeof id === "string" && id !== "" ) {
			this.id = id;
			
			return true;
		}
		
		return false;
	},
	
	
	
	/**
	 * @property {Object} The controller managing this test
	 */
	testController: null,
	
	/**
	 * Get the controller managing this test
	 *
	 * @param {void}
	 * @return {Object}
	 */
	getTestController: function() {
		return this.testController;
	},
	
	/**
	 * Set the test controller managing this test
	 *
	 * @param {Object} testController The controller managing this test
	 * @return {Boolean} True if set successfully
	 */
	setTestController: function( testController ) {
		if ( testController && typeof testController === "object" ) {
			this.testController = testController;
			
			return true;
		}
		
		return false;
	},
	
	
	
	/**
	 * @property {Object} The object responsible for churning out new instances
	 *                    of test objects.
	 */
	testFactory: null,
	
	/**
	 * Set the testFactory property
	 *
	 * @param {Object} testFactory
	 * @return {Boolean} True if set successfully
	 */
	setTestFactory: function( testFactory ) {
		if ( typeof testFactory === "object" && testFactory !== null ) {
			this.testFactory = testFactory;
			
			return true;
		}
		
		return false;
	},
	
	
	
	/**
	 * @property {Array} An array of tests that this suite performs
	 */
	tests: null,
	
	/**
	 * Create a new test in this test suite
	 *
	 * @param {String} testId The unique Id of this test
	 * @param {Function} doTest The function that contains the test code
	 * @returm {void}
	 */
	createTest: function( testId, doTest ) {
		if ( typeof doTest !== "function" ) {
			throw new Error( "TestSuite.prototype.createTest: Argument 2 must be the function that contains the test code." );
		}
		
		var test = this.testFactory.getInstance( this.id, this.testController, testId );
		
		// force-inject the method that contains the test code
		test.doTest = doTest;
		
		this.tests.push( test );
		
		test = null;
		return this;
	},
	
	/**
	 * Run all the tests in this suite.
	 *
	 * @param {void}
	 * @return {void}
	 */
	runTests: function() {
		if ( this.tests.length === 0 ) {
			return;
		}
		
		for ( var i = 0, length = this.tests.length; i < length; i++ ) {
			this.setupCallback( this.tests[ i ] );
			this.tests[ i ].runTest();
			this.teardownCallback( this.tests[ i ] );
		}
	},
	
	setup: function(callback) {
		this.setupCallback = callback;
		return this;
	},
	
	teardown: function(callback) {
		this.teardownCallback = callback;
		return this;
	},
	
	
	
	/**
	 * Get the summary of this test suite
	 *
	 * @param {void}
	 * @return {Object}
	 */
	getSummary: function() {
		var data = {
			pending: 0,
			inProgress: 0,
			passed: 0,
			failed: 0,
			timedOut: 0,
			total: this.tests.length,
			complete: 0,
			percentComplete: 0
		};
		
		var test = null;
		
		for ( var i = 0, length = this.tests.length; i < length; i++ ) {
			test = this.tests[ i ];
			
			if ( test.isPending() ) {
				data.pending++;
			}
			else if ( test.inProgress() ) {
				data.inProgress++;
			}
			else if ( test.hasPassed() ) {
				data.passed++;
			}
			else if ( test.hasFailed() ) {
				data.failed++;
			}
			else if ( test.hasTimedOut() ) {
				data.timedOut++;
			}
			
			if ( test.isComplete() ) {
				data.complete++;
			}
		}
		
		data.percentComplete = data.complete / data.total * 100;
		
		test = null;
		
		return data;
	},
	
	
	
	/**
	 * Get the number of failed tests.
	 *
	 * @param {void}
	 * @return {Number}
	 */
	getFailedCount: function() {
		var count = 0;
		
		for ( var i = 0, length = this.tests.length; i < length; i++ ) {
			if ( this.tests[ i ].hasFailed() ) {
				count++;
			}
		}
		
		return count;
	},
	
	/**
	 * Get the number of tests still in progress.
	 *
	 * @param {void}
	 * @return {Number}
	 */
	getInProgressCount: function() {
		var count = 0;
		
		for ( var i = 0, length = this.tests.length; i < length; i++ ) {
			if ( this.tests[ i ].inProgress() ) {
				count++;
			}
		}
		
		return count;
	},
	
	/**
	 * Get the number of passed tests.
	 *
	 * @param {void}
	 * @return {Number}
	 */
	getPassedCount: function() {
		var count = 0;
		
		for ( var i = 0, length = this.tests.length; i < length; i++ ) {
			if ( this.tests[ i ].hasPassed() ) {
				count++;
			}
		}
		
		return count;
	},
	
	/**
	 * Get the number of pending tests.
	 *
	 * @param {void}
	 * @return {Number}
	 */
	getPendingCount: function() {
		var count = 0;
		
		for ( var i = 0, length = this.tests.length; i < length; i++ ) {
			if ( this.tests[ i ].isPending() ) {
				count++;
			}
		}
		
		return count;
	},
	
	/**
	 * Get the number of timed out tests.
	 *
	 * @param {void}
	 * @return {Number}
	 */
	getTimedOutCount: function() {
		var count = 0;
		
		for ( var i = 0, length = this.tests.length; i < length; i++ ) {
			if ( this.tests[ i ].hasTimedOut() ) {
				count++;
			}
		}
		
		return count;
	}
	
};
