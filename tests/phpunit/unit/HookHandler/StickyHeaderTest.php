<?php

namespace MediaWiki\Extension\TableTools\Tests\HookHandler;

use MediaWiki\Extension\TableTools\HookHandler\StickyHeader;
use MediaWiki\Output\OutputPage;

/**
 * @coversDefaultClass \MediaWiki\Extension\TableTools\HookHandler\StickyHeader
 */
class StickyHeaderTest extends \MediaWikiUnitTestCase {

	/**
	 * @covers MediaWiki\Extension\TableTools\HookHandler\StickyHeader::onOutputPageBeforeHTML
	 */
	public function testOnBeforePageDisplayPositive() {
		$outputPageMock = $this->getMockBuilder( OutputPage::class )
			->disableOriginalConstructor()
			->getMock();

		$outputPageMock->expects( $this->once() )
			->method( 'addModules' )
			->with( 'ext.tableTools.stickyHeader' );

		$text = <<<HERE
Some text, some [[Link]] and a table with a sticky header:
<table class="wikitext mw-sticky-header">
	<tr><th>Header</th></tr>
	<tr><td>Content</td></tr>
</table>
Additional text.
HERE;

		( new StickyHeader() )->onOutputPageBeforeHTML( $outputPageMock, $text );
	}

	/**
	 * @covers MediaWiki\Extension\TableTools\HookHandler\StickyHeader::onOutputPageBeforeHTML
	 */
	public function testOnBeforePageDisplayNegative() {
		$outputPageMock = $this->getMockBuilder( OutputPage::class )
			->disableOriginalConstructor()
			->getMock();

		$outputPageMock->expects( $this->never() )
			->method( 'addModules' )
			->with( 'ext.tableTools.stickyHeader' );

		$text = <<<HERE
Some text, some [[Link]] and a table with a sticky header:
<table class="wikitext">
	<tr><th>Header</th></tr>
	<tr><td>Content</td></tr>
</table>
Additional text.
HERE;

		( new StickyHeader() )->onOutputPageBeforeHTML( $outputPageMock, $text );
	}
}
