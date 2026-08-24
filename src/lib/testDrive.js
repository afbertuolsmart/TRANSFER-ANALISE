import { getDrive } from "./googleDrive.js";

console.log("1 - Iniciando...");

async function test() {
  console.log("2 - Entrou na função");

  try {
    const drive = await getDrive();

    console.log("3 - Autenticado");

    const res = await drive.files.list({
      pageSize: 5,
      fields: "files(id,name)",
    });

    console.log("4 - Consulta realizada");

    console.log(res.data.files);
  } catch (err) {
    console.error("ERRO:");
    console.error(err);
  }
}

test();