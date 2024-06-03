<?php

namespace MediaWiki\Extension\TableTools\HookHandler;

use MediaWiki\Hook\OutputPageBeforeHTMLHook;

class StickyHeader implements OutputPageBeforeHTMLHook {

	/**
	 * @inheritDoc
	 */
	public function onOutputPageBeforeHTML( $out, &$text ) {
		$containsTableWithStickHeaderClass = false;

		preg_replace_callback(
			'#<table(.*?)>#',
			static function ( $matches ) use ( &$containsTableWithStickHeaderClass ) {
				if ( stripos( $matches[1], 'class="mw-sticky-header"' ) !== false ) {
					$containsTableWithStickHeaderClass = true;
				}

				preg_match_all(
					'/\s*([^\s=]+)\s*=\s*(\'[^\']*\'|"[^"]*")/',
					$matches[1],
					$kvMatches );

				foreach ( $kvMatches[1] as $i => $key ) {
					$normalKey = strtolower( $key );
					if ( $normalKey !== 'class' ) {
						continue;
					}
					$value = trim( $kvMatches[2][$i], '\'"' );
					$values = explode( ' ', $value );
					array_map( 'trim', $values );
					array_map( 'strtolower', $values );
					if ( in_array( 'mw-sticky-header', $values, true ) ) {
						$containsTableWithStickHeaderClass = true;
					}
				}

				return $matches[0];
			},
			$text
		);

		if ( $containsTableWithStickHeaderClass ) {
			$out->addModules( 'ext.tableTools.stickyHeader' );
		}
	}
}
