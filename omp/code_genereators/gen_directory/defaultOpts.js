const defaultOpts = {
    "non_ui_lib": "OmOrdr",
    "ui_lib": "OmOrdrUI",
    "entity": "Stockobj",
    "entities": "Stockobjs",
    "entity_hr_name": "Объект учета",
    "entities_hr_name": "Объекты учета",
    "columns": [{
        "columnName": "CODE",
        "columnDataType": "INTEGER",
        "columnDataLength": 0,
        "dataMemberName": "Code",
        "dataMemberType": "OMPCODE",
        "filterMemberName": "Codes",
        "filterMemberType": "long_set"
    }, {
        "columnName": "NUM",
        "columnDataType": "VARCHAR2",
        "columnDataLength": 256,
        "dataMemberName": "Num",
        "dataMemberType": "COmpStringT",
        "filterMemberName": "Num",
        "filterMemberType": "CLikeSensString"
    }
    ]
};
