/**
 * Code lens provider for diff hunks with accept/reject functionality
 */
define(function (require, exports, module) {
    "use strict";

    var codeLens = require("ace/ext/code_lens");

    function registerDiffCodeLensProvider(diffView, editor) {
        editor.commands.addCommand({
            name: "acceptDiffHunk",
            exec: function (editor, args) {
                var chunkIndex = args.chunkIndex;
                var chunk = diffView.chunks[chunkIndex];

                if (!chunk) return;

                if (diffView.showSideA) {
                    var content = diffView.diffSession.sessionB.getLines(
                        chunk.new.start.row,
                        chunk.new.end.row - 1
                    );
                    
                    diffView.diffSession.sessionA.replace(
                        {
                            start: {row: chunk.old.start.row, column: 0},
                            end: {row: chunk.old.end.row, column: 0}
                        },
                        content.join("\n") + "\n"
                    );
                } else {
                    var content = diffView.diffSession.sessionB.getLines(
                        chunk.new.start.row,
                        chunk.new.end.row - 1
                    );
                    
                    diffView.diffSession.sessionA.replace(
                        {
                            start: {row: chunk.old.start.row, column: 0},
                            end: {row: chunk.old.end.row, column: 0}
                        },
                        content.join("\n") + "\n"
                    );
                }

                diffView.onInput();
            }
        });

        editor.commands.addCommand({
            name: "rejectDiffHunk",
            exec: function (editor, args) {
                var chunkIndex = args.chunkIndex;
                var chunk = diffView.chunks[chunkIndex];

                if (!chunk) return;

                if (diffView.showSideA) {
                    var content = diffView.diffSession.sessionA.getLines(
                        chunk.old.start.row,
                        chunk.old.end.row - 1
                    );
                    
                    diffView.diffSession.sessionB.replace(
                        {
                            start: {row: chunk.new.start.row, column: 0},
                            end: {row: chunk.new.end.row, column: 0}
                        },
                        content.join("\n") + "\n"
                    );
                } else {
                    var content = diffView.diffSession.sessionA.getLines(
                        chunk.old.start.row,
                        chunk.old.end.row - 1
                    );

                    diffView.diffSession.sessionB.replace(
                        {
                            start: {row: chunk.new.start.row, column: 0},
                            end: {row: chunk.new.end.row, column: 0}
                        },
                        content.join("\n") + "\n"
                    );
                }

                diffView.onInput();
            }
        });

        editor.commands.addCommand({
            name: "acceptAllDiffs",
            exec: function (editor, args) {
                if (diffView.showSideA) {
                    var content = diffView.diffSession.sessionB.getValue();
                    diffView.diffSession.sessionA.setValue(content);
                } else {
                    var content = diffView.diffSession.sessionB.getValue();
                    diffView.diffSession.sessionA.setValue(content);
                }

                diffView.onInput();
            }
        });

        editor.commands.addCommand({
            name: "rejectAllDiffs",
            exec: function (editor, args) {
                if (diffView.showSideA) {
                    var content = diffView.diffSession.sessionA.getValue();
                    diffView.diffSession.sessionB.setValue(content);
                } else {
                    var content = diffView.diffSession.sessionA.getValue();
                    diffView.diffSession.sessionB.setValue(content);
                }

                diffView.onInput();
            }
        });

        codeLens.registerCodeLensProvider(editor, {
            provideCodeLenses: function (session, callback) {
                var lenses = [];

                if (!diffView.chunks || !diffView.chunks.length) {
                    callback(null, lenses);
                    return;
                }

                var firstChunkRow = diffView.showSideA ? 
                    diffView.chunks[0].old.start.row : 
                    diffView.chunks[0].new.start.row;
                
                lenses.push({
                    start: {
                        row: firstChunkRow,
                        column: 0
                    },
                    command: {
                        id: "acceptAllDiffs",
                        title: "Accept All",
                        arguments: {}
                    }
                });
                
                lenses.push({
                    start: {
                        row: firstChunkRow,
                        column: 0
                    },
                    command: {
                        id: "rejectAllDiffs",
                        title: "Reject All",
                        arguments: {}
                    }
                });

                diffView.chunks.forEach(function (chunk, index) {
                    var row = diffView.showSideA ? chunk.old.start.row : chunk.new.start.row;

                    lenses.push({
                        start: {
                            row: row,
                            column: 0
                        },
                        command: {
                            id: "acceptDiffHunk",
                            title: "Accept",
                            arguments: {chunkIndex: index}
                        }
                    });

                    lenses.push({
                        start: {
                            row: row,
                            column: 0
                        },
                        command: {
                            id: "rejectDiffHunk",
                            title: "Reject",
                            arguments: {chunkIndex: index}
                        }
                    });
                });

                callback(null, lenses);
            }
        });
    }

    exports.registerDiffCodeLensProvider = registerDiffCodeLensProvider;
});
