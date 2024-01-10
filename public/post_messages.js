// ************************************************************************
// Funkcija kojom klijent salje listu poruka (dialog) ka serveru.
//
// url - adresa servera koji komunicira sa openai
// messages = [
//   { role: "system", content: "You are helpful assistant." },
//   { role: "user", content: "Hi!" },
//   { role: "assistant", content: "Hello! How can I assist you today?" },
// ];
//
// povratna vrednost je JS objekat sa porukom
// ako zelis nastavak dialoga odgovor stavi u niz poruka
// formiraj novo pitanje, stavi u niz, posalji i cekaj odgovor
//
async function postMessages(url, messages) {
  const response = await fetch(url, {
    method: "POST",
    //   mode: "cors",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(messages),
  });

  // telo poruke pretvara u JS objekat
  // { role: "assistant", content: "message" }
  return response.json();
}

export { postMessages };
