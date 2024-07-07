import "./styles.css";

import { Color } from "@tiptap/extension-color";
import ListItem from "@tiptap/extension-list-item";
import TextStyle from "@tiptap/extension-text-style";
import { EditorProvider, useCurrentEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import React from "react";
import { Extension } from "@tiptap/core";
import diff_match_patch from "diff-match-patch";
import { useState } from "react";

let previousDocument = null;
let documentId;

const backendBaseUrl = "http://localhost:5087";

const MenuBar = () => {
  const { editor } = useCurrentEditor();
  const [existingDocumentId, setExistingDocumentId] = useState();

  if (!editor) {
    return null;
  }

  const handleCreateDocument = async () => {
    const doc = JSON.stringify(editor.getJSON());
    const response = await fetch(`${backendBaseUrl}/document`, {
      method: "POST",
      body: doc,
    });
    previousDocument = doc;
    documentId = await response.text();
    console.log(documentId);
  };

  const handleLoadDocument = async () => {
    const response = await fetch(
      `${backendBaseUrl}/document/${existingDocumentId}`,
      {
        method: "GET",
      }
    );
    if (!response.ok) {
      console.log(response.status, response.statusText);
      return;
    }
    const jsonContent = await response.json();
    editor.commands.setContent(jsonContent);
    documentId = existingDocumentId;
    previousDocument = JSON.stringify(jsonContent);
  };

  return (
    <div className="control-group">
      <div className="button-group">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          className={editor.isActive("bold") ? "is-active" : ""}
        >
          Bold
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          className={editor.isActive("italic") ? "is-active" : ""}
        >
          Italic
        </button>
        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          disabled={!editor.can().chain().focus().toggleStrike().run()}
          className={editor.isActive("strike") ? "is-active" : ""}
        >
          Strike
        </button>
        <button
          onClick={() => editor.chain().focus().toggleCode().run()}
          disabled={!editor.can().chain().focus().toggleCode().run()}
          className={editor.isActive("code") ? "is-active" : ""}
        >
          Code
        </button>
        <button onClick={() => editor.chain().focus().unsetAllMarks().run()}>
          Clear marks
        </button>
        <button onClick={() => editor.chain().focus().clearNodes().run()}>
          Clear nodes
        </button>
        <button
          onClick={() => editor.chain().focus().setParagraph().run()}
          className={editor.isActive("paragraph") ? "is-active" : ""}
        >
          Paragraph
        </button>
        <button
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          className={
            editor.isActive("heading", { level: 1 }) ? "is-active" : ""
          }
        >
          H1
        </button>
        <button
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          className={
            editor.isActive("heading", { level: 2 }) ? "is-active" : ""
          }
        >
          H2
        </button>
        <button
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          className={
            editor.isActive("heading", { level: 3 }) ? "is-active" : ""
          }
        >
          H3
        </button>
        <button
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 4 }).run()
          }
          className={
            editor.isActive("heading", { level: 4 }) ? "is-active" : ""
          }
        >
          H4
        </button>
        <button
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 5 }).run()
          }
          className={
            editor.isActive("heading", { level: 5 }) ? "is-active" : ""
          }
        >
          H5
        </button>
        <button
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 6 }).run()
          }
          className={
            editor.isActive("heading", { level: 6 }) ? "is-active" : ""
          }
        >
          H6
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive("bulletList") ? "is-active" : ""}
        >
          Bullet list
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive("orderedList") ? "is-active" : ""}
        >
          Ordered list
        </button>
        <button
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={editor.isActive("codeBlock") ? "is-active" : ""}
        >
          Code block
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={editor.isActive("blockquote") ? "is-active" : ""}
        >
          Blockquote
        </button>
        <button
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
        >
          Horizontal rule
        </button>
        <button onClick={() => editor.chain().focus().setHardBreak().run()}>
          Hard break
        </button>
        <button
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().chain().focus().undo().run()}
        >
          Undo
        </button>
        <button
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().chain().focus().redo().run()}
        >
          Redo
        </button>
        <button
          onClick={() => editor.chain().focus().setColor("#958DF1").run()}
          className={
            editor.isActive("textStyle", { color: "#958DF1" })
              ? "is-active"
              : ""
          }
        >
          Purple
        </button>
        <div>
          <button onClick={handleCreateDocument}>Create Document</button>
          <input
            style={{ marginLeft: "10px" }}
            name="inputDocumentId"
            type="number"
            placeholder="document id"
            value={existingDocumentId}
            onChange={(e) => {
              setExistingDocumentId(e.target.value);
            }}
          ></input>
          <button onClick={handleLoadDocument}>Load document</button>
        </div>
      </div>
    </div>
  );
};

const sendChanges = async (documentId, patches) => {
  const response = await fetch(`${backendBaseUrl}/document/${documentId}`, {
    method: "PATCH",
    body: patches,
  });

  if (!response.ok) console.log(response.status, response.statusText);

  return response.ok;
};

const computeChanges = (doc1, doc2) => {
  var dmp = new diff_match_patch();
  var diffs = dmp.diff_main(doc1, doc2);
  dmp.diff_cleanupEfficiency(diffs);
  const patches = dmp.patch_make(doc1, diffs);
  return dmp.patch_toText(patches);
};

let saveTimeout;

const debounceSave = (documentId, patches, callback) => {
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    sendChanges(documentId, patches).then((ok) => {
      console.log("calling callback with: ", ok);
      callback(ok);
    });
  }, 2000);
};

const customExtension = Extension.create({
  onUpdate({ editor }) {
    console.log("onUpdate");
    const newDocument = JSON.stringify(editor.getJSON());
    const pathes = computeChanges(previousDocument, newDocument);
    debounceSave(documentId, pathes, (ok) => {
      if (ok) previousDocument = newDocument;
    });
  },
  onCreate({ editor }) {
    // previousDocument = JSON.stringify(editor.getJSON());
  },
});

const extensions = [
  customExtension,
  Color.configure({ types: [TextStyle.name, ListItem.name] }),
  TextStyle.configure({ types: [ListItem.name] }),
  StarterKit.configure({
    bulletList: {
      keepMarks: true,
      keepAttributes: false, // TODO : Making this as `false` becase marks are not preserved when I try to preserve attrs, awaiting a bit of help
    },
    orderedList: {
      keepMarks: true,
      keepAttributes: false, // TODO : Making this as `false` becase marks are not preserved when I try to preserve attrs, awaiting a bit of help
    },
  }),
];

const content = `
<p>
  hello
</p>
`;

export default () => {
  return (
    <EditorProvider
      slotBefore={<MenuBar />}
      extensions={extensions}
      content={content}
    ></EditorProvider>
  );
};
