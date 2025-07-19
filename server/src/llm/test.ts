import { OperationFromPrompt } from './client';

console.log(
  JSON.stringify(
    await OperationFromPrompt(
      'Please add reminder for me to pick up laundry later today at 5 PM',
      5.5
    ),
    null,
    2
  )
);

console.log(
  JSON.stringify(
    await OperationFromPrompt(
      'Can you help me create event for Exit Interview on July 31st at 11 AM? it\'ll be an hour.',
5.5
    ),
    null,
    2
  )
);

console.log(
  JSON.stringify(
    await OperationFromPrompt('Is there anything I should do next day?'),
    null,
    2
  )
);

console.log(
  JSON.stringify(
    await OperationFromPrompt('Whats the next thing I needed to do today?'),
    null,
    2
  )
);

console.log(
  JSON.stringify(
    await OperationFromPrompt(
      'Please update my lunch hour today from 12 PM to 3 PM'
    ),
    null,
    2
  )
);

console.log(
  JSON.stringify(await OperationFromPrompt('What can you help me?'), null, 2)
);
