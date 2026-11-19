export function buildQuickReplyButtons(buttons) {
  if (!Array.isArray(buttons) || buttons.length < 1 || buttons.length > 3) {
    throw new Error('Es sind 1 bis 3 Antwortbuttons erlaubt.');
  }

  return buttons.map(button => {
    if (
      typeof button.id !== 'string' ||
      !button.id.trim() ||
      typeof button.displayText !== 'string' ||
      !button.displayText.trim() ||
      button.displayText.length > 20
    ) {
      throw new Error('Ungültige Button-ID oder Beschriftung.');
    }

    return {
      name: 'quick_reply',
      buttonParamsJson: JSON.stringify({
        display_text: button.displayText,
        id: button.id
      })
    };
  });
}

export function buildListButton(buttonText, rows) {
  if (
    typeof buttonText !== 'string' ||
    !buttonText.trim() ||
    !Array.isArray(rows) ||
    rows.length < 1 ||
    rows.length > 10
  ) {
    throw new Error('Ungültiges Auswahlmenü: 1 bis 10 Einträge erforderlich.');
  }

  const ids = new Set();

  const mappedRows = rows.map(row => {
    if (
      typeof row.id !== 'string' ||
      !row.id.trim() ||
      typeof row.title !== 'string' ||
      !row.title.trim() ||
      row.title.length > 24 ||
      ids.has(row.id)
    ) {
      throw new Error('Ungültiger oder doppelter Menüeintrag.');
    }

    ids.add(row.id);

    return {
      id: row.id,
      title: row.title,
      ...(row.description ? { description: row.description.slice(0, 72) } : {})
    };
  });

  return {
    name: 'single_select',
    buttonParamsJson: JSON.stringify({
      title: buttonText,
      sections: [{
        title: 'Themen',
        rows: mappedRows
      }]
    })
  };
}

export function getInteractiveReplyId(message) {
  const response = message?.interactiveResponseMessage;
  const params = response?.nativeFlowResponseMessage?.paramsJson;

  if (params) {
    try {
      const parsed = JSON.parse(params);
      return parsed.id || parsed.row_id || parsed.selectedRowId || null;
    } catch {
      return null;
    }
  }

  return response?.singleSelectReply?.selectedRowId || null;
}
