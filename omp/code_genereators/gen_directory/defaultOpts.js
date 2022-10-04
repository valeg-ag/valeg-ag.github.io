const defaultOpts = {
    "non_ui_lib": "OmOrdr",
    "ui_lib": "OmOrdrUI",
    "entity": "Stockobj",
    "entities": "Stockobjs",
    "entity_hr_name": "Объект учета",
    "entities_hr_name": "Объекты учета",
    "table_name": "_YOUR_TABLE_NAME_",
    "sequence_name": "_YOUR_SEQ_NAME_",
    "columns": [{
        "columnName": "CODE",
        "columnNameRus": "Код",
        "columnDataType": "INTEGER",
        "columnDataLength": 0,
        "dataMemberName": "Code",
        "dataMemberType": "OMPCODE",
        "filterMemberName": "Codes",
        "filterMemberType": "long_set"
    }, {
        "columnName": "NUM",
        "columnNameRus": "Номер",
        "columnDataType": "VARCHAR2",
        "columnDataLength": 256,
        "dataMemberName": "Num",
        "dataMemberType": "COmpStringT",
        "filterMemberName": "Num",
        "filterMemberType": "CLikeSensString"
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
