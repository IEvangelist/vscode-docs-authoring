import * as assert from 'assert';
import * as chai from 'chai';
import * as spies from 'chai-spies';
import { resolve } from 'path';
import { commands, window } from 'vscode';
import {
	insertTable,
	insertTableCommand,
	consolidateTable,
	distributeTable
} from '../../../controllers/table-controller';
import * as common from '../../../helper/common';
import * as telemetry from '../../../helper/telemetry';
import { loadDocumentAndGetItReady, sleep, sleepTime } from '../../test.common/common';

chai.use(spies);

import sinon = require('sinon');

const expect = chai.expect;

suite('Table Controller', () => {
	// Reset and tear down the spies
	teardown(() => {
		chai.spy.restore(common);
	});
	suiteTeardown(async () => {
		await commands.executeCommand('workbench.action.closeAllEditors');
	});

	test('insertTableCommand', () => {
		const controllerCommands = [
			{ command: consolidateTable.name, callback: consolidateTable },
			{ command: distributeTable.name, callback: distributeTable },
			{ command: insertTable.name, callback: insertTable }
		];
		expect(insertTableCommand()).to.deep.equal(controllerCommands);
	});
	test('noActiveEditorMessage', () => {
		const spy = chai.spy.on(common, 'noActiveEditorMessage');
		insertTable();
		expect(spy).to.have.been.called();
	});
	test('isMarkdownFileCheck', async () => {
		const filePath = resolve(
			__dirname,
			'../../../../../src/test/data/repo/articles/docs-markdown.md'
		);
		await loadDocumentAndGetItReady(filePath);

		const spy = chai.spy.on(common, 'isMarkdownFileCheck');
		insertTable();
		await sleep(sleepTime);
		expect(spy).to.have.been.called();
	});
	test('insertContentToEditor - Note', async () => {
		const filePath = resolve(
			__dirname,
			'../../../../../src/test/data/repo/articles/table-controller.md'
		);

		const stubShowInputBox = sinon.stub(window, 'showInputBox');
		stubShowInputBox.resolves('1:1');
		await loadDocumentAndGetItReady(filePath);
		insertTable();
		await sleep(sleepTime);

		const expectedText = '|Column1  |\n|---------|\n|Row1     |';
		const editor = window.activeTextEditor;
		const actualText = editor?.document.getText();
		assert.equal(expectedText, actualText);

		const stub = sinon.stub(telemetry, 'sendTelemetryData');
		const spy = chai.spy.on(common, 'insertContentToEditor');

		expect(spy).to.have.been.called();
		stub.restore();
	});
});
