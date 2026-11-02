// controllers/modelController.js
const mlService = require('../services/mlService');

// GET /api/models
const getModels = async (req, res, next) => {
  try {
    const data = await mlService.getModels();
    res.json({ success: true, ...data });
  } catch (err) {
    // Return static model info if ML service is down
    res.json({
      success: true,
      mlServiceAvailable: false,
      models: [
        {
          key: 'xgboost',
          name: 'XGBoost Regressor',
          description: 'Highly optimised gradient-boosting with regularisation.',
          metrics: { r2: 83.787477, mae: 1380.107056, rmse: 2659.178069, mape: 5.530829 },
          loaded: false,
        },
        {
          key: 'gbm',
          name: 'Gradient Boosting Machine',
          description: 'Sequential tree ensemble minimising residual error.',
          metrics: { r2: 81.210879, mae: 1741.845421, rmse: 2862.696368, mape: 6.823638 },
          loaded: false,
        },
        {
          key: 'rf',
          name: 'Random Forest Regressor',
          description: 'Bagged ensemble of decision trees.',
          metrics: { r2: 83.436123, mae: 1294.929394, rmse: 2687.837761, mape: 5.292456 },
          loaded: false,
        },
      ],
    });
  }
};

module.exports = { getModels };
