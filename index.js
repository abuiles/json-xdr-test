const XDR = require('js-xdr')
const jsonXDR = require('json-xdr')

const types = XDR.config((xdr) => {
  xdr.typedef("Hash", xdr.opaque(2));
  xdr.typedef('Int32', xdr.int());

  xdr.struct("Price", [
    ["n", xdr.lookup("Int32")],
    ["d", xdr.lookup("Int32")],
  ]);

  xdr.enum("MemoType", {
      memoNone: 0,
      memoText: 1,
      memoId: 2,
      memoHash: 3,
      memoReturn: 4,
  });

  xdr.union("Memo", {
    switchOn: xdr.lookup("MemoType"),
    switchName: "type",
    switches: [
      ["memoNone", xdr.void()],
      ["memoText", "text"],
      ["memoId", "id"]
    ],
    arms: {
      text: xdr.string(28),
      id: xdr.lookup("Int32")
    },
  });

  xdr.typedef('CounterInt', xdr.option(xdr.int()));

  xdr.struct('Event', [
    ["attendees", xdr.int()],
    ["eventName", xdr.string(50)],
    ["secretSpeakers", xdr.array(xdr.lookup("Hash"), 2)],
    ["speakers", xdr.varArray(xdr.string())],
    ["price", xdr.lookup("Price")],
    ["memo", xdr.lookup("Memo")],
    ['meta', xdr.lookup('TransactionMeta')],
    ['counter', xdr.lookup("CounterInt")]
  ])

  xdr.enum("TransactionMetaType", {
    none: 0,
    paid: 1
  });

  xdr.union("TransactionMeta", {
    switchOn: xdr.lookup("TransactionMetaType"),
    switches: [
      ["none", xdr.void()],
      ["paid", "price"]
    ],
    arms: {
      price: xdr.lookup("Price")
    },
    defaultArm: xdr.void()
  });
})



let event = new types.Event({
  attendees: 5,
  eventName: "Lumenauts get together",
  secretSpeakers: [Buffer.from([0, 0]), Buffer.from([0, 1])],
  speakers: ['Jed', 'Tom', 'Zac'],
  price: new types.Price({
    n: 2,
    d: 1
  }),
  memo: types.Memo.memoText("foo"),
  meta: types.TransactionMeta.paid(new types.Price({
    n: 2,
    d: 1
  })),
  counter: 2
})


let payload = jsonXDR.toJSON(event);

console.log("Payload from XDR to JSON")
console.log(JSON.stringify(payload,null,2))

console.log('\n\n\n')

console.log("Now let's convert that payload back to an XDR then to binary and back to js-xdr \n\n")


const xdrEvent = jsonXDR.toXDR(types.Event, payload); // read from jsonpayload
const xdrEventCopyFromBytes = types.Event.fromXDR( //
  xdrEvent.toXDR() // convert to buffer and read from Buffer back to js-xdr representation
);


console.log(xdrEventCopyFromBytes)

console.log('\n\n\n\n')
console.log('Done',' 🚢')
