// ________________Add Your Configuration Here_________________
// Add your email address(es) and label(s):

// paste your task system ingest email here:
var taskEmail = 'YOUR_TASK_SYSTEM_EMAIL_HERE';
// update this label if you don't like the default:
var taskProcessedLabelString = 'Script_Processed/Tasks';
// update this prefix if you don't like the default:
var taskPrefix = '[Task] '

// ________________You're Done Configuration!_________________




// No need to read below this line unless you want to!
// If you've put your email and label information in above, you're good to go :)


// using just one service, wrap up as email-label pair:
// (this structure allows usage of multiple services for advanced users)
var emailLabelPairs = [[taskEmail, taskProcessedLabelString]];

// Let's be gross and use global constants
var HEADER_FIELD_TO_USE_AS_MESSAGE_ID = 'Message-Id'.toLowerCase();
var UNABLE_TO_PARSE_MESSAGE_ID = 'Unable to parse universal Message-Id';


function getUniversalMessageId(message) {
  Logger.log('Getting universal message id for message %s', message);

  var googleId = message.getId();
  Logger.log('Google internal message id (different from header): %s', googleId);

  var rawContent = message.getRawContent();
  // Logger.log('raw_content: %s', rawContent);

  var rawContentLines = rawContent.split('\n');
  // Logger.log('raw_content_lines: %s', rawContentLines);

  for (var i = 0; i < rawContentLines.length; i++){

    var line = rawContentLines[i];

    if (line.substring(0, 10).toLowerCase() === HEADER_FIELD_TO_USE_AS_MESSAGE_ID) {
      Logger.log('Found the message id header field');

      var messageIdComponents = line.split(' ');
      Logger.log('messageIdComponents: %s', messageIdComponents);

      // at this point, either messageIdComponents[1] holds the Message-ID
      // value (with brackets), or the sender (eg outlook which behaves
      // differently) has a newline following the Message-ID key and the actual
      // value is on the next line (with this line being either undefined or a
      // newline)
      if ((typeof messageIdComponents[1] === "undefined") || (messageIdComponents[1].length <= 1)) {
        Logger.log("Message-ID header line appears to be split into two lines");
        Logger.log("Next line: " + rawContentLines[i + 1]);
        var idWithAligatorBrackets = rawContentLines[i + 1];
      } else {
        var idWithAligatorBrackets = messageIdComponents[1];
      };
      Logger.log('id_with_aligagtor_brackets: %s', idWithAligatorBrackets);

      var messageId = idWithAligatorBrackets.split('<')[1].split('>')[0];

      Logger.log('Universal Message-ID parsed from header: %s', messageId);
      return messageId;
    };
  };

  // If we can't parse out a message id but don't care to debug it, we can just
  // return our failure
  return UNABLE_TO_PARSE_MESSAGE_ID;
};

function SendNewMessageWithCustomBody(originalMessage) {
  // Create subject and body of new message to send
  var prefixedSubject = taskPrefix + originalMessage.getSubject();
  var body = originalMessage.getPlainBody() ? originalMessage.getPlainBody() : originalMessage.getBody();

  // Try to get the universal message id
  var messageId = getUniversalMessageId(originalMessage);
  if (messageId === UNABLE_TO_PARSE_MESSAGE_ID) {
    var messageLink = 'Unable to parse out message id';
  } else {
    var messageLink = 'message:<' + messageId + '>';
  };

  // Modify message body to include message link
  var bodyWithLink = 'View Message in Mail: '+ messageLink + '\n\n' + body;

  // Send out the email to all emails listed in email_label_pairs
  Logger.log('emailLabelPairs in send func: %s', emailLabelPairs);
  emailLabelPairs.forEach(function(emailLabelPair) {
    GmailApp.sendEmail(emailLabelPair[0], prefixedSubject, bodyWithLink);
  });
};

function markImportantAddLabelsUnstarMessagesArchiveThread(thread) {

  Logger.log('Marking thread important');
  // Mark the thread important
  thread.markImportant();

  Logger.log('Adding processed labels');
  // Add each processed label to the thread
  emailLabelPairs.forEach(function(emailLabelPair) {
    // (we delay getting the actual label as long as possible because of rate
    // limits:)
    var actualLabel = GmailApp.getUserLabelByName(emailLabelPair[1]);
    thread.addLabel(actualLabel);
  });

  Logger.log('Unstarring messages in thread');
  // Unstar each message in the thread
  var thread_messages = thread.getMessages();
  thread_messages.forEach(function(message) {
    message.unstar();
  });

  Logger.log('Archiving the thread');
  // Archive the thread
  GmailApp.moveThreadToArchive(thread);

  Logger.log('Leaving markImportant... function');
};

function main() {
  Logger.log('Beginning main');

  // Go through the inbox threads:
  var inbox_threads = GmailApp.getInboxThreads();
  inbox_threads.forEach(function(thread) {
    var messages = thread.getMessages().reverse();
    messages.forEach(function(message) {
      if (message.isStarred()) {
        // For the most recent (if any) starred message in each thread:
        SendNewMessageWithCustomBody(message);
        markImportantAddLabelsUnstarMessagesArchiveThread(thread);
      };
    });
  });
};
