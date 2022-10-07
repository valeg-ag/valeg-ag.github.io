const defaultOpts = {
    "non_ui_lib": "OmOrdr",
    "ui_lib": "OmOrdrUI",
    "entity": "CancelCheckPermissionsToChangeLotOrder",
    "entities": "CancelCheckPermissionsToChangeLotOrder",
    "entity_hr_name": "Отмена контроля ТМЦ по подразделению",
    "entities_hr_name": "Отмена контроля ТМЦ по подразделению",
    "table_name": "CNCL_CHK_PERMS_CHNG_LOTORD",
    "sequence_name": "SQ_CNCL_CHK_PERMS_CHNG_LOTORD",
    "columns": [
        {
            "columnName": "CODE",
            "columnNameRus": "Код",
            "columnDataType": "INTEGER",
            "columnDataLength": 0,
            "dataMemberName": "Code",
            "dataMemberType": "OMPCODE",
            "filterMemberName": "Codes",
            "filterMemberType": "long_set"
        },
        {
            "columnName": "STOCKOBJ",
            "columnNameRus": "ТМЦ",
            "columnDataType": "INTEGER",
            "columnDataLength": 0,
            "dataMemberName": "Stockobj",
            "dataMemberType": "OMPCODE",
            "filterMemberName": "Stockobj",
            "filterMemberType": "StockobjAttrsFlt"
        },
        {
            "columnName": "DIVISION",
            "columnNameRus": "Подразделение",
            "columnDataType": "INTEGER",
            "columnDataLength": 0,
            "dataMemberName": "Division",
            "dataMemberType": "OMPCODE",
            "filterMemberName": "Divisions",
            "filterMemberType": "DivsSects"
        },
        {
            "columnName": "CREATE_DATE",
            "columnNameRus": "Дата создания",
            "columnDataType": "DATE",
            "columnDataLength": 0,
            "dataMemberName": "CreateDate",
            "dataMemberType": "ITDate",
            "filterMemberName": "CreateDate",
            "filterMemberType": "IntervalData"
        }
    ]
};
