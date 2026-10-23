/* eslint-disable */

( function ( mw, $, d, undefined ) {
    const Vue = require( 'vue' );
    const GridApp = require( './components/DataTable.vue' );

    var tables = $( '.datagrid, .data-grid' );
    for ( tableIndex = 0; tableIndex < tables.length; tableIndex++ ) {
        var invalidFormat = false;
        const fragment = document.createDocumentFragment();

        var table = tables[tableIndex];
        var tableClassName = $( table ).attr( 'class' );

        if ( tableClassName === undefined ) {
            tableClassName = '';
        }

        var spec = {
            className: tableClassName,
            cols: [],
            rows: []
        };

        // Attributes other than class are not supported by the Grid component, so they are re-applied to the DOM
        var copyAttrs = function ( el ) {
            var attrs = {};
            $.each( el.attributes, function ( i, a ) {
                if ( a.name !== 'class' && a.name !== 'rowspan' && a.name !== 'colspan' ) {
                    attrs[a.name] = a.value;
                }
            } );
            return attrs;
        };
        var tableAttrs = copyAttrs( table );
        var headAttrs = [];
        var bodyAttrs = [];

        var pending = [];
        var colTypes = [];
        var rows = $( table ).find( 'tr' );
        for ( rowIndex = 0; rowIndex < rows.length; rowIndex++ ) {
            var row = rows[rowIndex];
            // Expand rowspan/colspan by repeating the spanned cell, so every row has one cell per column
            var cells = [];
            var ownCells = $( row ).children( 'th, td' );
            var col = 0;
            var nextOwn = 0;
            while ( nextOwn < ownCells.length || pending.some( function ( p, i ) { return p && i >= col; } ) ) {
                if ( pending[col] ) {
                    cells.push( pending[col].el );
                    if ( --pending[col].left === 0 ) {
                        pending[col] = null;
                    }
                    col++;
                    continue;
                }
                if ( nextOwn >= ownCells.length ) {
                    col++;
                    continue;
                }
                var own = ownCells[nextOwn++];
                var rs = Math.max( parseInt( $( own ).attr( 'rowspan' ), 10 ) || 1, 1 );
                var cs = Math.max( parseInt( $( own ).attr( 'colspan' ), 10 ) || 1, 1 );
                for ( var k = 0; k < cs; k++ ) {
                    cells.push( own );
                    if ( rs > 1 ) {
                        pending[col + k] = { el: own, left: rs - 1 };
                    }
                }
                col += cs;
            }
            var rowCells = [];
            var rowCellAttrs = [];
            for ( cellIndex = 0; cellIndex < cells.length; cellIndex++ ) {
                var cell = cells[cellIndex];
                let cellClass = $( cell ).attr( 'class' );
                if ( !cellClass ) {
                    cellClass = '';
                }

                if ( rowIndex === 0 ) {
                    headAttrs.push( copyAttrs( cell ) );
                    let colType = 'html';
                    if ( $( cell ).hasClass( 'int' ) || $( cell ).hasClass( 'numeric' ) ) {
                        colType = 'numeric'
                    } else if ( $( cell ).hasClass( 'string' ) ) {
                        colType = 'string'
                    } else if ( $( cell ).hasClass( 'boolean' ) ) {
                        colType = 'boolean'
                    }
                    colTypes.push( colType );

                    var col = {
                        label: $( cell ).html(),
                        dataIndex: cellIndex+1,
                        type: colType,
                        sortable: true,
                        filterable: true,
                        class: cellClass
                    }
                    spec.cols.push( col );
                } else {
                    let cellContent = $( cell ).html();
                    if ( colTypes[cellIndex] === 'boolean' ) {
                        if ( cellContent.trim() === 'true' || cellContent.trim() === '1' ) {
                            cellContent = true;
                        } else if ( cellContent.trim() === 'false' || cellContent.trim() === '0' ) {
                            cellContent = false;
                        } else {
                            cellContent = undefined;
                        }
                    }
                    var cell = {
                        dataIndex: cellIndex+1,
                        content: cellContent,
                        class: cellClass
                    }
                    rowCells.push( cell );
                    rowCellAttrs.push( copyAttrs( cells[cellIndex] ) );
                }
            }
            if ( rowCells.length > 0 ) {
                // dataIndex is the v-for key of the Grid; without it re-sorting does not reorder the rows
                spec.rows.push( {
                    class: $( row ).attr( 'class' ) || '',
                    dataIndex: spec.rows.length + 1,
                    data: rowCells
                } );
                bodyAttrs.push( { row: copyAttrs( row ), cells: rowCellAttrs } );
            }
        }

        function render() {
            var h = Vue.h;

            var vm = Vue.createMwApp( {
                render: function() {
                    return h( GridApp, spec );
                }
            } );

            vm.mount( fragment );

            var applyAttrs = function ( el, attrs ) {
                $.each( attrs, function ( name, value ) {
                    if ( name !== 'data-index' && name !== 'data-type' && name !== 'data-rowindex' ) {
                        el.setAttribute( name, value );
                    }
                } );
            };
            var newTable = fragment.querySelector( 'table' );
            if ( newTable ) {
                applyAttrs( newTable, tableAttrs );
                $( newTable ).find( 'thead th' ).each( function ( i, th ) {
                    applyAttrs( th, headAttrs[i] || {} );
                } );
                $( newTable ).find( 'tbody > tr' ).each( function ( i, tr ) {
                    var attrs = bodyAttrs[i] || { row: {}, cells: [] };
                    applyAttrs( tr, attrs.row );
                    $( tr ).children( 'td' ).each( function ( j, td ) {
                        applyAttrs( td, attrs.cells[j] || {} );
                    } );
                } );
            }

            // https://www.reddit.com/r/vuejs/comments/i1vwyw/vue_3_createapp_does_not_replace_mount_element/?rdt=38765
            table.parentNode.replaceChild( fragment, table );
        };

        // rowspan and colspan is not supported
        if ( invalidFormat === false ) {
            render();
        }
    }
} )( mediaWiki, jQuery, document );