module.exports = (sequelize, type) => {
  class Feature extends sequelize.Model { }
  Feature.init({
    name: {
      type: type.STRING,
      allowNull: false
    },
    line: {
      type: type.GEOMETRY('LINESTRING', 4326)
    },
    point:{
      type: type.GEOMETRY('POINT', 4326)
    },
    date:{
      type: type.DATE,
      defaultValue: type.NOW
    },
    comment:{
      type: type.STRING,
    }
  }, {
    sequelize,
    modelName: 'grandview',
    timestamps: false,
    freezeTableName: true
  })
  return Feature
}
