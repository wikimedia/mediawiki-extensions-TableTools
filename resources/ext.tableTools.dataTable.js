/* eslint-disable */

( function ( mw, $, d, undefined ) {
	const Vue = require( 'vue' );
	const GridApp = require( 'ext.vuejsplus-data-grid.vue' );

	const tables = $( '.datagrid, .data-grid' );
	for ( tableIndex = 0; tableIndex < tables.length; tableIndex++ ) {
		let invalidFormat = false;
		const fragment = document.createDocumentFragment();

		var table = tables[ tableIndex ];
		let tableClassName = $( table ).attr( 'class' );

		if ( tableClassName === undefined ) {
			tableClassName = '';
		}

		var spec = {
			class: tableClassName,
			cols: [],
			rows: []
		};

		const rows = $( table ).find( 'tr' );
		for ( rowIndex = 0; rowIndex < rows.length; rowIndex++ ) {
			const row = rows[ rowIndex ];
			let cells = $( row ).find( 'th' );
			if ( cells.length === 0 ) {
				cells = $( row ).find( 'td' );
			}
			const rowCells = [];
			for ( cellIndex = 0; cellIndex < cells.length; cellIndex++ ) {
				var cell = cells[ cellIndex ];
				if ( $( cell ).attr( 'rowspan' ) || $( cell ).attr( 'colspan' ) ) {
					invalidFormat = true;
				}
				if ( rowIndex === 0 ) {
					const col = {
						label: $( cell ).html(),
						dataIndex: cellIndex + 1,
						type: 'string',
						sortable: true,
						filterable: true
					};
					spec.cols.push( col );
				} else {
					var cell = {
						dataIndex: cellIndex + 1,
						content: $( cell ).html()
					};
					rowCells.push( cell );
				}
			}
			if ( rowCells.length > 0 ) {
				spec.rows.push( {
					class: '',
					data: rowCells
				} );
			}
		}

		function render() {
			const h = Vue.h;

			const vm = Vue.createMwApp( {
				render: function () {
					return h( GridApp, spec );
				}
			} );

			vm.mount( fragment );

			// https://www.reddit.com/r/vuejs/comments/i1vwyw/vue_3_createapp_does_not_replace_mount_element/?rdt=38765
			table.parentNode.replaceChild( fragment, table );
		}

		// rowspan and colspan is not supported
		if ( invalidFormat === false ) {
			render();
		}
	}
}( mediaWiki, jQuery, document ) );
