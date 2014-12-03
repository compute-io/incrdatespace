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

var timestamp = /^\d{10}$|^\d{13}$/,
	rounders = [ 'floor', 'ceil', 'round' ];


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
		value = new Date( value );
	}
	if ( !(value instanceof Date) ) {
		throw new TypeError( 'incrdatespace()::invalid input argument. ' + name + ' date must either be a date string, Date object, Unix timestamp, or JavaScript timestamp.' );
	}
	return value;
} // end FUNCTION validDate()


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
		incr = 86400000,
		flg = true,
		round,
		end,
		d,
		tmp,
		arr;

	start = validDate( start, 'Start' );
	stop = validDate( stop, 'Stop' );

	if ( nArgs > 2 ) {
		if ( nArgs === 3 ) {
			if ( isObject( incr ) ) {
				opts = incr;
			} else {
				incr = increment;

				// Turn off checking the options object...
				flg = false;
			}
		} else {
			opts = options;
			incr = increment;
		}
		// TODO: validate increment
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

	arr = new Array( 1 );
	arr[ 0 ] = start;

	// TODO: algorithm
	return arr;
} // end FUNCTION incrdatespace()


// EXPORTS //

module.exports = incrdatespace;
