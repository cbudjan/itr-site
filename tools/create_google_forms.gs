/**
 * International Tea Room — creates the "Join" and "Contact" Google Forms.
 *
 * Run once from https://script.google.com while signed in as tearoomseminars@gmail.com:
 *   1. New project → paste this file → Run ▸ createItrForms → authorize.
 *   2. Read the embed URLs from the execution log and paste them into hugo.toml
 *      (params.forms.subscribe_google_form_url / contact_google_form_url).
 *
 * What it sets up:
 *   - Both forms owned by this account, no Google sign-in required to respond.
 *   - Responses linked to a spreadsheet "ITR form responses" (one tab per form).
 *   - An on-submit trigger that emails a summary of every submission to this account.
 */

var NOTIFY_EMAIL = Session.getActiveUser().getEmail(); // = the signed-in account

function createItrForms() {
  trashStrayFiles_();
  var ss = SpreadsheetApp.create('ITR form responses');
  var join = buildJoinForm_();
  var contact = buildContactForm_();

  join.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());
  contact.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());

  ScriptApp.newTrigger('onItrFormSubmit').forForm(join).onFormSubmit().create();
  ScriptApp.newTrigger('onItrFormSubmit').forForm(contact).onFormSubmit().create();

  Logger.log('\n=== Paste into hugo.toml ===');
  Logger.log('subscribe_google_form_url = "%s?embedded=true"', join.getPublishedUrl());
  Logger.log('contact_google_form_url   = "%s?embedded=true"', contact.getPublishedUrl());
  Logger.log('\nEdit links:\n  Join:    %s\n  Contact: %s', join.getEditUrl(), contact.getEditUrl());
  Logger.log('Responses spreadsheet: %s', ss.getUrl());
  Logger.log('Submission notifications go to: %s', NOTIFY_EMAIL);
}

/** Removes leftovers from earlier (failed) runs so re-running does not create duplicates. */
function trashStrayFiles_() {
  ['ITR form responses', 'Join the International Tea Room', 'Contact the International Tea Room']
    .forEach(function (name) {
      var it = DriveApp.getFilesByName(name);
      while (it.hasNext()) it.next().setTrashed(true);
    });
  ScriptApp.getProjectTriggers().forEach(function (t) { ScriptApp.deleteTrigger(t); });
}

function buildJoinForm_() {
  var f = FormApp.create('Join the International Tea Room');
  f.setDescription(
    'Membership is by request. The organizers review each request and reply by email, ' +
    'usually within a week. There is no fee.\n\n' +
    'Tell us who you are, what you work on, and what you would like to receive.');
  f.setConfirmationMessage('Thanks — we have received your request and will be in touch by email.');
  f.setLimitOneResponsePerUser(false).setAllowResponseEdits(false)
   .setCollectEmail(false).setProgressBar(false).setShowLinkToRespondAgain(false);

  f.addSectionHeaderItem().setTitle('About you');
  f.addTextItem().setTitle('Full name').setRequired(true);
  f.addTextItem().setTitle('Email').setHelpText('Institutional address preferred.').setRequired(true)
    .setValidation(FormApp.createTextValidation().requireTextIsEmail().build());
  f.addTextItem().setTitle('Lab / group and institution')
    .setHelpText('e.g. Martinez Arias lab, UPF Barcelona').setRequired(true);
  f.addListItem().setTitle('Position').setRequired(true).setChoiceValues([
    'PhD student', 'Postdoc', 'Research scientist / staff', 'Group leader / PI',
    "Master's / undergraduate", 'Industry', 'Other']);
  f.addTextItem().setTitle('Lab website or profile (optional)')
    .setHelpText('Helps us screen requests.');

  f.addSectionHeaderItem().setTitle('Your work');
  f.addCheckboxItem().setTitle('Which models do you work with, or plan to work with?')
    .setChoiceValues([
      'Mouse gastruloids', 'Human gastruloids', 'Gastruloids from other species',
      'Trunk-like structures, somitoids, neuruloids', 'Blastoids, embryoids, ETX/ETiX',
      '2D micropattern models', 'Organoids / assembloids', 'Computational / theory'])
    .showOtherOption(true).setRequired(true);
  f.addParagraphTextItem().setTitle('One or two sentences on your research interest').setRequired(true);

  f.addSectionHeaderItem().setTitle('What would you like?');
  f.addCheckboxItem().setTitle('Select all that apply').setChoiceValues([
    'Email announcements of upcoming sessions (Zoom links)',
    'Invitation to the community Slack',
    'Access to recordings when available']).setRequired(true);

  f.addSectionHeaderItem().setTitle('Get involved (optional)');
  f.addCheckboxItem().setTitle('Interested in…').setChoiceValues([
    "I'd like to present my work", 'I want to suggest a speaker']);
  f.addParagraphTextItem().setTitle('Anything else? Speaker suggestions, topics you would like covered…');
  f.addTextItem().setTitle('How did you hear about the Tea Room?');

  f.addCheckboxItem().setTitle('Consent').setChoiceValues([
    'I agree that the organizers store this information to manage membership and send announcements. I can ask to be removed at any time.'])
    .setRequired(true);
  return f;
}

function buildContactForm_() {
  var f = FormApp.create('Contact the International Tea Room');
  f.setDescription('Questions about the series, speaker suggestions, or interest in presenting your own work. We usually reply within a week.');
  f.setConfirmationMessage('Thanks — your message has been sent to the organizers.');
  f.setLimitOneResponsePerUser(false).setAllowResponseEdits(false)
   .setCollectEmail(false).setProgressBar(false).setShowLinkToRespondAgain(false);

  f.addTextItem().setTitle('Name').setRequired(true);
  f.addTextItem().setTitle('Email').setRequired(true)
    .setValidation(FormApp.createTextValidation().requireTextIsEmail().build());
  f.addListItem().setTitle('Topic').setRequired(true).setChoiceValues([
    'General question', "Speaker suggestion / I'd like to present", 'Membership / mailing list',
    'Slack access', 'Zoom or website issue', 'Other']);
  f.addParagraphTextItem().setTitle('Message')
    .setHelpText('Write as much as you like. The box grows automatically as you type.').setRequired(true);
  return f;
}

/** Emails a summary of each submission to the account that owns the forms. */
function onItrFormSubmit(e) {
  var form = e.source, resp = e.response;
  var lines = [], replyTo = '';
  resp.getItemResponses().forEach(function (ir) {
    var v = ir.getResponse();
    if (Array.isArray(v)) v = v.join('; ');
    lines.push(ir.getItem().getTitle() + ': ' + v);
    if (/^email$/i.test(ir.getItem().getTitle())) replyTo = String(v);
  });
  MailApp.sendEmail({
    to: NOTIFY_EMAIL,
    replyTo: replyTo || NOTIFY_EMAIL,
    subject: '[ITR] New response: ' + form.getTitle(),
    body: lines.join('\n') + '\n\nAll responses: ' + form.getSummaryUrl()
  });
}
