/* global describe, it, require */
'use strict';

// MODULES //

var // Expectation library:
	chai = require( 'chai' ),

	// Module to be tested:
	incrdatespace = require( './../lib' );


// VARIABLES //

var expect = chai.expect,
	assert = chai.assert;


// TESTS //

describe( 'compute-incrdatespace', function tests() {

	it( 'should export a function', function test() {
		expect( incrdatespace ).to.be.a( 'function' );
	});

	it( 'should throw an error if not provided a valid start date', function test() {
		var stop, values;

		stop = new Date();

		values = [
			'beep',
			5,
			-5,
			true,
			NaN,
			null,
			undefined,
			[],
			{},
			function(){}
		];

		for ( var i = 0; i < values.length; i++ ) {
			expect( badValue( values[i] ) ).to.throw( Error );
		}

		function badValue( value ) {
			return function() {
				incrdatespace( value, stop );
			};
		}
	});

	it( 'should throw an error if not provided a valid stop date', function test() {
		var start, values;

		start = new Date().getTime();

		values = [
			'beep',
			5,
			-5,
			true,
			NaN,
			null,
			undefined,
			[],
			{},
			function(){}
		];

		for ( var i = 0; i < values.length; i++ ) {
			expect( badValue( values[i] ) ).to.throw( Error );
		}

		function badValue( value ) {
			return function() {
				incrdatespace( start, value );
			};
		}
	});

	it( 'should throw an error if provided an invalid increment', function test() {
		var start, stop, values;

		start = new Date().getTime();
		stop = new Date();

		values = [
			true,
			NaN,
			null,
			undefined,
			[],
			function(){}
		];

		for ( var i = 0; i < values.length; i++ ) {
			expect( badValue1( values[i] ) ).to.throw( TypeError );
			expect( badValue2( values[i] ) ).to.throw( TypeError );
		}

		function badValue1( value ) {
			return function() {
				incrdatespace( start, stop, value );
			};
		}
		function badValue2( value ) {
			return function() {
				incrdatespace( start, stop, value, {} );
			};
		}
	});

	it( 'should throw an error if unable to parse an increment string', function test() {
		var start, stop, values;

		start = new Date().getTime();
		stop = new Date();

		values = [
			'beep',
			'5ms-4sec',
			'w5'
		];

		for ( var i = 0; i < values.length; i++ ) {
			expect( badValue( values[i] ) ).to.throw( Error );
		}

		function badValue( value ) {
			return function() {
				incrdatespace( start, stop, value );
			};
		}
	});

	it( 'should throw an error if provided a non-object for options', function test() {
		var start, stop, values;

		start = new Date().getTime();
		stop = new Date();

		values = [
			'beep',
			5,
			true,
			NaN,
			null,
			undefined,
			[],
			function(){}
		];

		for ( var i = 0; i < values.length; i++ ) {
			expect( badValue( values[i] ) ).to.throw( Error );
		}

		function badValue( value ) {
			return function() {
				incrdatespace( start, stop, 10, value );
			};
		}
	});

	it( 'should throw an error if provided an invalid round option', function test() {
		var start, stop, values;

		start = new Date().getTime();
		stop = new Date();

		values = [
			'beep',
			5,
			true,
			NaN,
			null,
			undefined,
			[],
			{},
			function(){}
		];

		for ( var i = 0; i < values.length; i++ ) {
			expect( badValue( values[i] ) ).to.throw( Error );
		}

		function badValue( value ) {
			return function() {
				incrdatespace( start, stop, 10, { 'round': value });
			};
		}
	});

	it( 'should ignore unrecognized options', function test() {
		var start, stop, values;

		start = new Date().getTime();
		stop = new Date();

		values = [
			'beep',
			'boop'
		];

		for ( var i = 0; i < values.length; i++ ) {
			expect( okValue( values[i] ) ).to.not.throw( Error );
		}

		function okValue( value ) {
			var opts = {};
			opts[ value ] = 'floor';
			return function() {
				incrdatespace( start, stop, 10, opts );
			};
		}
	});

	it( 'should return a single element array if provided an increment which exceeds the absolute difference between the start and end times', function test() {
		var start = new Date().getTime(),
			stop = new Date(),
			actual;

		actual = incrdatespace( start, stop, 1 );

		assert.deepEqual( actual, [ new Date( start ) ] );
	});

	it( 'should return an array of `Date` objects', function test() {
		var start, stop, actual;

		stop = '2014-12-02T07:00:55.973Z';
		start = new Date( stop ) - 86400000;

		actual = incrdatespace( start, stop );

		assert.isArray( actual );
		for ( var i = 0; i < actual.length; i++ ) {
			assert.ok( actual[i] instanceof Date );
		}
	});

	it( 'should supply a default increment', function test() {
		var start, stop, actual;

		stop = '2014-12-02T07:00:55.973Z';
		start = new Date( stop ) - 2*86400000;

		actual = incrdatespace( start, stop, { 'round': 'floor' });

		assert.ok( actual.length );
		assert.ok( actual[0] < actual[1] );
	});

	it( 'should output both incremental and decremental arrays', function test() {
		var start, stop, actual;

		stop = '2014-12-02T07:00:55.973Z';
		start = new Date( stop ) - 2*86400000;

		// Incremental:
		actual = incrdatespace( start, stop, { 'round': 'floor' });

		assert.ok( actual[0] < actual[1] );

		// Decremental:
		actual = incrdatespace( stop, start, -86400000, { 'round': 'round' });

		assert.ok( actual[0] > actual[1] );
	});

	it( 'should create a linearly spaced array of dates', function test() {
		var start, stop, expected, actual;

		stop = '2014-12-02T07:00:55.973Z';
		start = new Date( stop ) - 5000;

		actual = incrdatespace( start, stop, 1000 );

		for ( var i = 0; i < actual.length; i++ ) {
			actual[ i ] = actual[ i ].getTime();
		}

		expected = [
			1417503650973,
			1417503651973,
			1417503652973,
			1417503653973,
			1417503654973
		];

		assert.deepEqual( actual, expected );

		// Large array:
		stop = '2014-12-02T07:00:55.973Z';
		start = new Date( stop ) - 1e6;

		actual = incrdatespace( start, stop, 1 );
		assert.strictEqual( actual.length, 1e6 );
	});

	it( 'should accept Unix timestamps', function test() {
		var start, stop, expected, actual;

		stop = '2014-12-02T07:00:55.973Z';
		stop = new Date( stop ).getTime();
		stop = Math.floor( stop / 1000 );
		start = stop - 5;

		actual = incrdatespace( start, stop, '1s' );

		for ( var i = 0; i < actual.length; i++ ) {
			actual[ i ] = actual[ i ].getTime();
		}

		expected = [
			1417503650000,
			1417503651000,
			1417503652000,
			1417503653000,
			1417503654000
		];

		assert.deepEqual( actual, expected );
	});

	it( 'should accept a unit string', function test() {
		var start, stop, expected, actual;

		stop = '2014-12-02T07:00:55.973Z';
		stop = new Date( stop ).getTime();
		stop = Math.floor( stop / 1000 );
		start = stop - 5;

		actual = incrdatespace( start, stop, 'sec' );

		for ( var i = 0; i < actual.length; i++ ) {
			actual[ i ] = actual[ i ].getTime();
		}

		expected = [
			1417503650000,
			1417503651000,
			1417503652000,
			1417503653000,
			1417503654000
		];

		assert.deepEqual( actual, expected );
	});

	it( 'should accept a formatted string of scalar-unit pairs of arbitrary complexity', function test() {
		var start, stop, expected, actual;

		stop = '2014-12-02T07:00:55.973Z';
		stop = new Date( stop ).getTime();
		stop = Math.floor( stop / 1000 );
		start = stop - 5;

		actual = incrdatespace( stop, start, '-0day.1sec.1000ms' );

		for ( var i = 0; i < actual.length; i++ ) {
			actual[ i ] = actual[ i ].getTime();
		}

		expected = [
			1417503655000,
			1417503653000,
			1417503651000
		];

		assert.deepEqual( actual, expected );
	});

	it( 'should ceil date values', function test() {
		var start, stop, expected, actual;

		stop = '2014-12-02T07:00:55.973Z';
		start = new Date( stop ) - 5;

		actual = incrdatespace( start, stop, 0.5, {'round': 'ceil' } );

		for ( var i = 0; i < actual.length; i++ ) {
			actual[ i ] = actual[ i ].getTime();
		}

		expected = [
			1417503655968,
			1417503655969,
			1417503655969,
			1417503655970,
			1417503655970,
			1417503655971,
			1417503655971,
			1417503655972,
			1417503655972,
			1417503655973
		];

		assert.deepEqual( actual, expected );
	});

	it( 'should floor date values', function test() {
		var start, stop, expected, actual;

		stop = '2014-12-02T07:00:55.973Z';
		start = new Date( stop ) - 5;

		actual = incrdatespace( start, stop, 0.5, {'round': 'floor' } );

		for ( var i = 0; i < actual.length; i++ ) {
			actual[ i ] = actual[ i ].getTime();
		}

		expected = [
			1417503655968,
			1417503655968,
			1417503655969,
			1417503655969,
			1417503655970,
			1417503655970,
			1417503655971,
			1417503655971,
			1417503655972,
			1417503655972
		];

		assert.deepEqual( actual, expected );
	});

	it( 'should round date values', function test() {
		var start, stop, expected, actual;

		stop = '2014-12-02T07:00:55.973Z';
		start = new Date( stop ) - 5;

		actual = incrdatespace( start, stop, 0.5, {'round': 'round' } );

		for ( var i = 0; i < actual.length; i++ ) {
			actual[ i ] = actual[ i ].getTime();
		}

		expected = [
			1417503655968,
			1417503655969,
			1417503655969,
			1417503655970,
			1417503655970,
			1417503655971,
			1417503655971,
			1417503655972,
			1417503655972,
			1417503655973
		];

		assert.deepEqual( actual, expected );
	});

	it( 'should return a single element array for incompatible increments', function test() {
		var start, stop, actual;

		stop = '2014-12-02T07:00:55.973Z';
		start = new Date( stop ) - 5;

		actual = incrdatespace( start, stop, -1 );

		assert.strictEqual( actual.length, 1 );
		assert.strictEqual( actual[ 0 ].getTime(), start );

		actual = incrdatespace( start, stop, 6 );

		assert.strictEqual( actual.length, 1 );
		assert.strictEqual( actual[ 0 ].getTime(), start );
	});

});
