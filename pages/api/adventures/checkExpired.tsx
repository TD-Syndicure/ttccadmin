export default async function handler(req: any, res: any) {

  try {

    const requestData = JSON.parse(req.body)
    const expirationDate = new Date(+requestData.expiration)
    const isExpired = new Date() > expirationDate

    if (!isExpired) {
      res.status(200).json({ info: "notexpired" });
    } else {
      res.status(200).json({ info: "failed" });
    }
  } catch (e) {
    console.log(e)
    res.status(500).json({ info: "failed" });
  }

}
