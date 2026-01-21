const Stats = require("../model/stats.model")

exports.getGlobalStats = async (req, res) => {
  try {
    const totals = await Stats.getTotals()
    const topMenus = await Stats.getTopMenusWeek()

    return res.status(200).json({ totals, topMenus })
  } catch (e) {
    console.log(e)
    return res.status(500).json({ message: "Erreur stats", e })
  }
}

exports.getPeriodStats = async (req, res) => {
  try {
    const { start, end } = req.query

    if (!start || !end) {
      return res.status(400).json({ message: "Dates manquantes" })
    }

    const result = await Stats.getSalesByPeriod(start, end)
    res.status(200).json(result)
  } catch (e) {
    console.error("Erreur période:", e)
    res.status(500).json({ message: "Erreur période", error: e.message })
  }
}


exports.getCategoryStats = async (_, res) => {
  try {
    const result = await Stats.getSalesByCategory()
    res.status(200).json(result)
  } catch (e) {
    res.status(500).json({ message: "Erreur catégorie", e })
  }
}

exports.getPaymentsHistory = async (_, res) => {
  try {
    const result = await Stats.getPaymentsHistory()
    res.status(200).json(result)
  } catch (e) {
    res.status(500).json({ message: "Erreur paiements", e })
  }
}