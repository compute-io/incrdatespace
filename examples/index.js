'use strict';

var incrdatespace = require( './../lib' ),
	start,
	stop,
	arr;

stop = '2014-12-02T07:00:54.973Z';
start = new Date( stop ) - 8640000;

// Default behavior:
console.log( '\nDefault:' );
arr = incrdatespace( start, stop );
console.log( arr.join( '\n' ) );

// Specify increment:
console.log( '\nIncrement 12h:' );
arr = incrdatespace( start, stop, '12h' );
console.log( arr.join( '\n' ) );

// Create an array using a negative increment:
console.log( '\nDecrement 12h:' );
arr = incrdatespace( stop, start, '-12h' );
console.log( arr.join( '\n' ) );
