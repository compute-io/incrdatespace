/**
*
*	COMPUTE: incrdatespace
*
*
*	DESCRIPTION:
*		- Generates an array of linearly spaced dates using a provided increment.
*
*
*	NOTES:
*		[1]
*
*
*	TODO:
*		[1]
*
*
*	LICENSE:
*		MIT
*
*	Copyright (c) 2014. Athan Reines.
*
*
*	AUTHOR:
*		Athan Reines. kgryte@gmail.com. 2014.
*
*/

'use strict';

var isObject = require( 'validate.io-object' );


// VARIABLES //

var rounders,
	convert,
	timestamp,
	units,
	reUnits,
	fmt;

// Rounding options:
rounders = [ 'floor', 'ceil', 'round' ];

// Conversions to milliseconds:
convert = {
	'ms': 1,
	's': 1000, // 1*1000
	'm': 60000, // 60*1000
	'h': 3600000, // 60000*60
	'd': 86400000, // 3600000*24
	'w': 604800000, // 86400000*7
	'b': 2629800000, // 365.25/12*86400000
	'y': 31557600000 // 365.25*86400000
};

// Regular expressions...
timestamp = /^\d{10}$|^\d{13}$/;

reUnits = {
	'ms': /ms|millisecond|milliseconds/,
	's': /s|sec|second|seconds/,
	'm': /m|min|minute|minutes/,
	'h': /h|hr|hour|hours/,
	'd': /d|day|days/,
	'w': /w|wk|week|weeks/,
	'b': /b|month|months/,
	'y': /y|yr|year|years/
};
units = [
	'y',
	'b',
	'w',
	'd',
	'h',
	'm',
	's',
	'ms'
];

fmt = /(\d+[a-z])/g;


// FUNCTIONS //

/**
* FUNCTION: validDate( value, name )
*	Validates a date parameter.
*
* @private
* @param {*} value - value to be validated
* @param {String} name - name to be used in error messages
* @returns {Date} validated date
*/
function validDate( value, name ) {
	var type;

	type = typeof value;
	if ( type === 'string' ) {
		value = Date.parse( value );
		if ( value !== value ) {
			throw new Error( 'incrdatespace()::invalid input argument. Unable to parse ' +  name.toLowerCase() + ' date.' );
		}
		value = new Date( value );
	}
	if ( type === 'number' ) {
		if ( !timestamp.test( value ) ) {
			throw new Error( 'incrdatespace()::invalid input argument. Numeric ' + name.toLowerCase() + ' date must be either a Unix or Javascript timestamp.' );
		}
		if ( value.toString().length === 10 ) {
			value = value * 1000; // sec to ms
		}
		value = new Date( value );
	}
	if ( !(value instanceof Date) ) {
		throw new TypeError( 'incrdatespace()::invalid input argument. ' + name + ' date must either be a date string, Date object, Unix timestamp, or JavaScript timestamp.' );
	}
	return value;
} // end FUNCTION validDate()

/**
* FUNCTION: validIncrement( x )
*	Validates an increment.
*
* @private
* @param {String|Number} x - increment to be validated
* @returns {Number} increment in milliseconds
*/
function validIncrement( x ) {
	var sign = false,
		parts,
		len,
		unit,
		val,
		i, N;

	if ( typeof x === 'number' ) {
		if ( x !== x ) {
			throw new TypeError( 'incrdatespace()::invalid value. Increment must be a valid number.' );
		}
		return x;
	}
	if ( typeof x !== 'string' ) {
		throw new TypeError( 'incrdatespace()::invalid value. Increment must be either a string or number.' );
	}
	if ( x[ 0 ] === '-' ) {
		sign = true;
	}
	parts = x.match( fmt );
	len = parts.length;
	if ( !len ) {
		throw new Error( 'incrdatespace()::invalid value. Unable to parse increment string.' );
	}
	// Convert the formatted string to milliseconds...
	N = units.length;
	x = 0;
	while ( len ) {
		val = parts.pop();
		for ( i = 0; i < N; i++ ) {
			unit = units[ i ];
			if ( reUnits[ unit ].test( val ) ) {
				val = parseInt( val, 10 );
				x += convert[ unit ];
				break;
			}
		}
		len = parts.length;
	}
	return x;
} // end FUNCTION validIncrement()


// INCRDATESPACE //

/**
* FUNCTION: incrdatespace( start, stop[, increment, options])
*	Generates an array of linearly spaced dates using a provided increment.
*
* @param {Date|Number|String} start - start time as either a `Date` object, Unix timestamp, JavaScript timestamp, or date string
* @param {Data|Number|String} stop - stop time as either a `Date` object, Unix timestamp, JavaScript timestamp, or date string
* @param {Number|String} [increment] - value by which to increment successive dates (default: 'day')
* @param {Object} [options] - function options
* @param {String} [options.round] - specifies how sub-millisecond times should be rounded: [ 'floor', 'ceil', 'round' ] (default: 'floor' )
* @returns {Array} array of dates
*/
function incrdatespace( start, stop, increment, options ) {
	var nArgs = arguments.length,
		opts = {
			'round': 'floor'
		},
		incr = convert[ 'd' ],
		flg = true,
		round,
		len,
		i,
		tmp,
		arr;

	start = validDate( start, 'Start' );
	stop = validDate( stop, 'Stop' );

	if ( nArgs > 2 ) {
		if ( nArgs === 3 ) {
			if ( isObject( increment ) ) {
				opts = increment;
			} else {
				incr = increment;

				// Turn off checking the options object...
				flg = false;
			}
		} else {
			opts = options;
			incr = increment;
		}
		incr = validIncrement( incr );
		if ( flg ) {
			if ( !isObject( opts ) ) {
				throw new TypeError( 'incrdatespace()::invalid input argument. Options must be an object.' );
			}
			if ( opts.hasOwnProperty( 'round' ) ) {
				if ( typeof opts.round !== 'string' ) {
					throw new TypeError( 'incrdatespace()::invalid input argument. Round option must be a string.' );
				}
				if ( rounders.indexOf( opts.round ) === -1 ) {
					throw new Error( 'incrdatespace()::invalid input argument. Unrecognized round option. Must be one of [' + rounders.join( ',' ) + '].' );
				}
			} else {
				opts.round = 'floor';
			}
		}
	}
	round = Math[ opts.round ];

	// Calculate the array length:
	len = Math.ceil( ( stop-start ) / incr );
	if ( len < 0 ) {
		return [ start ];
	}

	// Build the output array...
	if ( len > 64000 ) {
		// Ensure fast elements...
		arr = [];
		arr.push( start );
		tmp = start.getTime();
		for ( i = 1; i < len; i++ ) {
			tmp += incr;
			arr.push( new Date( round( tmp ) ) );
		}
		return arr;
	}
	arr = new Array( len );
	arr[ 0 ] = start;
	tmp = start.getTime();
	for ( i = 1; i < len; i++ ) {
		tmp += incr;
		arr[ i ] = new Date( round( tmp ) );
	}
	return arr;
} // end FUNCTION incrdatespace()


// EXPORTS //

module.exports = incrdatespace;
