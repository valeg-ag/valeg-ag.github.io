const TAB = "  ";

function getIncludesForDataType(dt) {
    switch (dt) {
        case "StockobjAttrsFlt": return [`"OmUtils/StockobjAttrsFlt.h"`];
        case "DivsSects": return [`"OmUtils/DivsSects.h"`];
    }

    return [];
}

function getIncludesForFilteringDataType(dt) {
    if (dt === "StockobjAttrsFlt") return [`"OmUtils/StockobjAttrsFlt.h"`];

    return [];
}

function getIncludeForSerializeXMLData(dt) {
    if (dt === "StockobjAttrsFlt") return [`"OmUtilsUI/StockobjAttrsFltUiHelper.h"`];

    return [];
}

function dup(str, length) {
    const str_ = `${str}`;
    const spaces_count = length - str_.length;
    return str_ + " ".repeat(spaces_count > 0 ? spaces_count : 0);
}

function toSnakeCase(str) {
    if (!str.length) {
        return "";
    }

    let res = str.charAt(0).toLowerCase();
    for (let i = 1; i < str.length; i++) {
        if (str.charAt(i).toLowerCase() === str.charAt(i)) {
            res = res + str.charAt(i);
        } else {
            res = res + "_" + str.charAt(i).toLowerCase();
        }
    }

    return res;
}

class DirectoryCppGenerator {
    /**
     * @param {object} opts
     */
    constructor(opts) {
        this.entity = opts.entity;
        this.entities = opts.entities;
        this.entity_hr_name = opts.entity_hr_name;
        this.entities_hr_name = opts.entities_hr_name;
        this.non_ui_lib = opts.non_ui_lib;
        this.ui_lib = opts.ui_lib;
        this.table_name = opts.table_name;
        this.sequence_name = opts.sequence_name;
        this.columns = opts.columns;

        if(this.table_name && this.table_name.length > 30) {
            alert("table_name is too long");
            throw Error("table_name is too long");
        }

        if(this.sequence_name && this.sequence_name.length > 30) {
            alert("sequence_name is too long");
            throw Error("sequence_name is too long");
        }
    }

    generate() {
        return `// ${this.dataHeaderFilePath()}
///////////////////////////////////////////////////////////////////////////////
${this.generateDataHeader()}\n\n\n
// ${this.non_ui_lib}/${this.entities}Service.h
///////////////////////////////////////////////////////////////////////////////
${this.generateServiceHeader()}\n\n\n
// ${this.non_ui_lib}/${this.entities}Service.cpp
///////////////////////////////////////////////////////////////////////////////
${this.generateServiceCpp()}\n\n\n
// ${this.non_ui_lib}/${this.entities}RestAttrs.h
///////////////////////////////////////////////////////////////////////////////
${this.generateRestAttrsHeader()}\n\n\n
// ${this.non_ui_lib}/${this.entities}Rest.h
///////////////////////////////////////////////////////////////////////////////
${this.generateRestHeader()}\n\n\n
// ${this.non_ui_lib}/${this.entities}Rest.cpp
///////////////////////////////////////////////////////////////////////////////
${this.generateRestCpp()}\n\n\n
// ${this.non_ui_lib}/${this.entities}XmlExchanger.h
///////////////////////////////////////////////////////////////////////////////
${this.generateXmlExchangerHeader()}\n\n\n
// ${this.non_ui_lib}/${this.entities}XmlExchanger.cpp
///////////////////////////////////////////////////////////////////////////////
${this.generateXmlExchangerCpp()}\n\n\n
// ${this.ui_lib}/${this.entities}Cell.h
///////////////////////////////////////////////////////////////////////////////
${this.generateCellHeader()}\n\n\n
// ${this.ui_lib}/${this.entities}Cell.cpp
///////////////////////////////////////////////////////////////////////////////
${this.generateCellCpp()}\n\n\n
// ${this.ui_lib}/${this.entities}FilterCell.h
///////////////////////////////////////////////////////////////////////////////
${this.generateFilterCellHeader()}\n\n\n
// ${this.ui_lib}/${this.entities}FilterCell.cpp
///////////////////////////////////////////////////////////////////////////////
${this.generateFilterCellCpp()}\n\n\n
// ${this.ui_lib}/${this.entities}List.h
///////////////////////////////////////////////////////////////////////////////
${this.generateListHeader()}\n\n\n
// ${this.ui_lib}/${this.entities}List.cpp
///////////////////////////////////////////////////////////////////////////////
${this.generateListCpp()}
// ${this.ui_lib}/${this.entities}UiService.h
///////////////////////////////////////////////////////////////////////////////
${this.generateUiServiceHeader()}
// ${this.ui_lib}/${this.entities}UiService.cpp
///////////////////////////////////////////////////////////////////////////////
${this.generateUiServiceCpp()}`
    }

    generateDataHeader() {
        const headers = new Set();
        for(const col of this.columns) {
            getIncludesForDataType(col.dataMemberType).forEach(h => headers.add(h));
            getIncludesForDataType(col.filterMemberType).forEach(h => headers.add(h));
        }

        return `#pragma once
${[...headers].map(h => `#include ${h}`).join("\n")}\n
${this.generateDataStructCode()}\n
${this.generateFilterStructCode()}\n`
    }

    generateServiceHeader() {
        return `#pragma once
#include "./${this.dataHeaderFileName()}"
#include "OIDs.h"

class IMXmlExchange;

struct I${this.entities}Service : IOmpUnknown
{
  virtual void Insert( ${this.dataStruct()}& data ) = 0;
  virtual void Update( ${this.dataStruct()}& data ) = 0;
  virtual void Delete( const ${this.dataStruct()}& data ) = 0;

  virtual omp::shared_vec< ${this.dataStruct()} > LoadByCodes( std::set< OMPCODE > codes ) = 0;
  virtual ${this.dataStruct()} LoadByCode( OMPCODE code ) = 0;
  virtual omp::shared_vec< ${this.dataStruct()} > LoadByFilter( const ${this.filterStruct()}& flt ) = 0;

  virtual std::unique_ptr< IMXmlExchange > GetXmlExchanger( const ${this.dataStruct()}& data ) = 0;
};

DECLARE_DEFAULT_OID( I${this.entities}Service, OID_${this.entities}Service );\n`
    }

    generateServiceCpp() {
        const headers = new Set();
        for(const col of this.columns) {
            getIncludesForFilteringDataType(col.filterMemberType).forEach(h => headers.add(h));
        }

        return `#include "stdafx.h"

#include "./${this.entities}Service.h"
#include "./${this.entities}XmlExchanger.h"
${[...headers].map(h => `#include ${h}`).join("\n")}
#include "OmUtils/SQLUtils.h"
#include "core/MFieldDescStorage.h"

namespace ${this.namespace()}
{
// clang-format off
${this.generateFieldDescCode()}
// clang-format on

class ServiceImpl : public I${this.entities}Service
{
public:
  void Insert( ${this.dataStruct()}& data ) override;
  void Update( ${this.dataStruct()}& data ) override;
  void Delete( const ${this.dataStruct()}& data ) override;

  omp::shared_vec< ${this.dataStruct()} > LoadByCodes( std::set< OMPCODE > codes ) override;
  ${this.dataStruct()} LoadByCode( OMPCODE code ) override;
  omp::shared_vec< ${this.dataStruct()} > LoadByFilter( const ${this.filterStruct()}& flt ) override;

  std::unique_ptr< IMXmlExchange > GetXmlExchanger( const ${this.dataStruct()}& data ) override;
};
}

OMP_OBJECT_ENTRY_AUTO_NS( OID_${this.entities}Service, ${this.namespace()}, ServiceImpl );

// clang-format off
${this.generateFdMakeWhereCode()}
// clang-format on

namespace ${this.namespace()}
{
using StorageT = XmlHistoryFdStorage< FdImpl, ${this.dataStruct()}, ${this.filterStruct()}, XmlExchanger >;

void ServiceImpl::Insert( ${this.dataStruct()}& data )
{
  StorageT().Insert( data );
}

void ServiceImpl::Update( ${this.dataStruct()}& data )
{
  StorageT().Update( data );
}

void ServiceImpl::Delete( const ${this.dataStruct()}& data )
{
  StorageT().Delete( data );
}

${this.dataStruct()} ServiceImpl::LoadByCode( OMPCODE code )
{
  return StorageT().LoadByCode( code );
}

omp::shared_vec< ${this.dataStruct()} > ServiceImpl::LoadByCodes( std::set< OMPCODE > codes )
{
  ${this.filterStruct()} flt;
  flt.Codes = std::move( codes );

  return LoadByFilter( flt );
}

omp::shared_vec< ${this.dataStruct()} > ServiceImpl::LoadByFilter( const ${this.filterStruct()}& flt )
{
  return StorageT().LoadByFilterShared( flt );
}

std::unique_ptr< IMXmlExchange > ServiceImpl::GetXmlExchanger( const ${this.dataStruct()} & data )
{
  return std::make_unique< XmlExchanger >( data );
}
}\n`;
    }

    generateRestAttrsHeader() {

        const restAttrs = this.columns.map(col => {
            return dup(`#define ${this.entity}RestAttr_${col.dataMemberName}`, 70) + `"${toSnakeCase(col.dataMemberName)}"\n`
        });

        return `#pragma once

${restAttrs.join("")}`;
    }

    generateRestHeader() {
        return `#pragma once
#include "./${this.dataHeaderFileName()}"
#include "OmUtils/RestObjI.h"

namespace ${this.namespace()}
{
class RestObject : public IMCell, public rest::IObject, public ${this.dataStruct()}
{
public:
  RestObject();
  explicit RestObject( const RestObject& src );
  explicit RestObject( const ${this.dataStruct()}& src );

  void Clear() override;
  void Copy( const IMCell& src ) override;
  IMCell* Clone() const override;

  void ProvideRestObjectAttrs( rest::ExchangeItemList& itemlist ) override;
};

class RestLoader : public rest::IDataLoader
{
public:
  omp::vector< rest::ObjectPointer > LoadRestData( rest::IFilter* filter, rest::RestDataDesc& dataDesc ) override;
};
}\n`;
    }

    generateRestCpp() {
        const provRestAttrs = this.columns.map(col => {
            if (col.columnName === "CODE") {
                return `  itemlist.SetIntegerAttr( ${this.entity}RestAttr_${col.dataMemberName}, "${col.columnNameRus}", &${col.dataMemberName} );`
            }
            if (col.columnDataType === "DATE") {
                return `  itemlist.SetDateAttr( ${this.entity}RestAttr_${col.dataMemberName}, "${col.columnNameRus}", &${col.dataMemberName} );`
            }

            return `  itemlist.Set_SOME_Attr( ${this.entity}RestAttr_${col.dataMemberName}, "${col.columnNameRus}", &${col.dataMemberName} );`
        });

        return `#include "stdafx.h"

#include "./${this.entities}Rest.h"
#include "./${this.entities}RestAttrs.h"
#include "./${this.entities}Service.h"
#include "OmUtils/RestObjExchange.h"
#include "OmUtils/RestObjUtils.h"
#include "RestApp/Shared/RestDataIDs.h"
#include "core/coretcontainerutils.h"

namespace ${this.namespace()}
{
RestObject::RestObject()
{
  Clear();
}

RestObject::RestObject( const RestObject& src )
{
  Copy( src );
}

RestObject::RestObject( const ${this.dataStruct()}& src )
{
  Clear();
  ${this.dataStruct()}::copy( src );
}

void RestObject::Clear()
{
    ${this.dataStruct()}::clear();
}

void RestObject::Copy( const IMCell& src )
{
  const RestObject& s = omp::cast( src );
  ${this.dataStruct()}::copy( s );
}

IMCell* RestObject::Clone() const
{
  return new RestObject{ *this };
}

void RestObject::ProvideRestObjectAttrs( rest::ExchangeItemList& itemlist )
{
${provRestAttrs.join("\n")}
}

omp::vector< rest::ObjectPointer > RestLoader ::LoadRestData( rest::IFilter* filter, rest::RestDataDesc& dataDesc )
{
  rest::FilterCodes* f = omp::cast( filter );
  if( !f )
    rest::Raise::NullFilter();

  COmpPtr< I${this.entities}Service > service;
  auto loadedDataVec{ service->LoadByCodes( omp::to_set( f->Codes ) ) };

  auto result{ omp::to_vec( loadedDataVec, []( auto& data ) { return std::make_shared< RestObject >( *data ); } ) };

  return omp::to_vec( result, []( auto& data ) { return std::dynamic_pointer_cast< rest::IObject >( data ); } );
}
}\n`;
    }

    generateXmlExchangerHeader() {
        return `#pragma once
#include "./${this.dataHeaderFileName()}"
#include "core/kmm/MXmlExchange.h"

namespace ${this.namespace()}
{
class XmlExchanger : public ${this.dataStruct()}, public IMCell, public IMXmlExchange
{
public:
  XmlExchanger();
  explicit XmlExchanger( const XmlExchanger& src );
  explicit XmlExchanger( const ${this.dataStruct()}& src );

  // IMCell
  void Clear() override;
  void Copy( const IMCell& src ) override;
  IMCell* Clone() const override;
  OMPCODE* GetCodePtr() override;

  // IMXmlExchange
  OMPCODE GetXmlDocType() override;
  void DoXmlExchange( CXmlDataExchange& dx ) override;
  bool SaveHistoryEnabled() override;
};
}\n`;
    }

    generateXmlExchangerCpp() {
        const ddxmlAttrs = this.columns.filter(col => col.columnName !== "CODE")
            .map(col => {
                return `  DDXml_SOMEDDXML( dx, "${col.columnNameRus}", ${col.dataMemberName} );`;
            });

        return `#include "stdafx.h"

#include "./${this.entities}XmlExchanger.h"
#include "OmMiscUI/XmlDocIDs.h"
#include "OmUtils/CustomDXML.h"
#include "core/kmm/XmlExchangeRegister.h"

REGISTER_XML_EXCHANGER_TYPE( XmlDoc_${this.entity}, ${this.namespace()}::XmlExchanger );

namespace ${this.namespace()}
{
XmlExchanger::XmlExchanger()
{
  Clear();
}

XmlExchanger::XmlExchanger( const XmlExchanger& src )
{
  Copy( src );
}

XmlExchanger::XmlExchanger( const ${this.dataStruct()}& src )
{
  Clear();
  ${this.dataStruct()}::copy( src );
}

void XmlExchanger::Clear()
{
  XmlExchangeClear();
  ${this.dataStruct()}::clear();
}

void XmlExchanger::Copy( const IMCell& src )
{
  const auto& s = dynamic_cast< const XmlExchanger& >( src );
  XmlExchangeCopy( s );
  ${this.dataStruct()}::copy( s );
}

IMCell* XmlExchanger::Clone() const
{
  return new XmlExchanger( *this );
}

OMPCODE* XmlExchanger::GetCodePtr()
{
  return &Code;
}

OMPCODE XmlExchanger::GetXmlDocType()
{
  return XmlDoc_${this.entity};
}

void XmlExchanger::DoXmlExchange( CXmlDataExchange& dx )
{
${ddxmlAttrs.join("\n")}
}

bool XmlExchanger::SaveHistoryEnabled()
{
  return true;
}
}\n`;
    }

    generateCellHeader() {
        return `#pragma once
#include "${this.dataHeaderFilePath()}"
#include "core/kmm/MXmlExchange.h"
#include "uicore/KMM/MQtProperties.h"

namespace ${this.namespace()}
{
class Cell : public ${this.dataStruct()},
             public IMCell,
             public IMSQLBase,
             public IMProperties,
             public IMQtProperties,
             public IGetXmlExchanger,
             public IMStyle
{
public:
  Cell();
  explicit Cell( const ${this.dataStruct()}& src );
  explicit Cell( const Cell& src );

  // IMCell
  void Clear() override;
  void Copy( const IMCell& src ) override;
  IMCell* Clone() const override;
  OMPCODE* GetCodePtr() override;

  // IMSQLBase
  void InsertRequest( TwQuery& query ) override;
  void UpdateRequest( TwQuery& query ) override;
  void DeleteRequest( TwQuery& query ) override;

  // IMProperties
  void EnumPropertyPages( MPropertyPageArray& pages ) override;
  CString GetCaptionName() override;
  OMPCODE GetEditRightCode() const override;

  // IGetXmlExchanger
  std::shared_ptr< IMXmlExchange > GetXmlExchanger() override;

  // IMStyle
  bool GetStyle( CGXStyle& style, OMPCODE HID, CGXStyle& hStyle, MDataManager* pMng, bool readOnly ) override;
};
}\n`;
    }

    generateCellCpp() {
        const getStyleCases = this.columns.filter(col => col.columnName !== "CODE")
            .map(col => {
                if(col.columnDataType === "DATE") {
                    return `    case FilterCell::Hid_${col.dataMemberName}:\n      GSShower( style ).SetDate( CreateDate );\n      return true;`
                }
                return `    case FilterCell::Hid_${col.dataMemberName}:\n      style.SetValue( ${col.dataMemberName} );\n      return true;`;
            });

        return `#include "stdafx.h"

#include "./${this.entities}Cell.h"
#include "./${this.entities}FilterCell.h"
#include "OmOrdr/${this.entities}Service.h"
#include "uicore/KMM/MQtPropertyPage.h"
#include "uicore/SmartClearCopyCell.h"
#include <Rights.h>

#include "ui_${this.entities}CellPage.h"

namespace
{
enum
{
  ppMain = 1,
};
}

namespace ${this.namespace()}
{
Cell::Cell()
{}

Cell::Cell( const ${this.dataStruct()}& src )
{
  Clear();
  ${this.dataStruct()}::copy( src );
}

Cell::Cell( const Cell& src )
{
  Copy( src );
}

void Cell::Clear()
{
  ${this.dataStruct()}::clear();
  omp::SmartClearBase( *this );
}

void Cell::Copy( const IMCell& src )
{
  const auto& s = dynamic_cast< const Cell& >( src );
  ${this.dataStruct()}::copy( s );
  omp::SmartCopyBase( *this, src );
}

IMCell* Cell::Clone() const
{
  return new Cell( *this );
}

OMPCODE* Cell::GetCodePtr()
{
  return &Code;
}

void Cell::InsertRequest( TwQuery& query )
{
  COmpPtr< I${this.entities}Service > service;
  service->Insert( *this );
}

void Cell::UpdateRequest( TwQuery& query )
{
  COmpPtr< I${this.entities}Service > service;
  service->Update( *this );
}

void Cell::DeleteRequest( TwQuery& query )
{
  COmpPtr< I${this.entities}Service > service;
  service->Delete( *this );
}

class UiCellPage : public IQtUiFormMixin< UiCellPage, Ui::${this.entities}CellPage >
{
public:
  UiCellPage( Cell& data_ ) : data{ data_ }
  {}

  void onInitDialog( MQtPropertyPageWidget* wgt ) override;
  void doDataExchange( QtDataExchange& dx ) override;

public:
  Cell& data;
};

void Cell::EnumPropertyPages( MPropertyPageArray& pages )
{
  pages.Add( new MQtPropertyPage( ppMain, this, new UiCellPage( *this ) ) );
}

CString Cell::GetCaptionName()
{
  return "${this.entity_hr_name}";
}

OMPCODE Cell::GetEditRightCode() const
{
  return 0;
}

std::shared_ptr< IMXmlExchange > Cell::GetXmlExchanger()
{
  return COmpPtr< I${this.entities}Service >()->GetXmlExchanger( *this );
}

bool Cell::GetStyle( CGXStyle& style, OMPCODE HID, CGXStyle& hStyle, MDataManager* pMng, bool readOnly )
{
  switch( HID )
  {
${getStyleCases.join("\n\n")}
  }

  return IMStyle::GetStyle( style, HID, hStyle, pMng, readOnly );
}

void UiCellPage::onInitDialog( MQtPropertyPageWidget* wgt )
{}

void UiCellPage::doDataExchange( QtDataExchange& dx )
{
  DDX_QtString( dx, leNum, data.Num );
}
}\n`;
    }

    generateFilterCellHeader() {
        let nextHidNum = 1;
        const hids = this.columns.filter(col => col.columnName !== "CODE")
            .map(col => `    Hid_${col.dataMemberName} = ${nextHidNum++},`)

        return `#pragma once
#include "${this.dataHeaderFilePath()}"
#include "uicore/KMM/MQtProperties.h"
#include "uicore/KMM/MXMLFilter.h"
#include "uicore/MBrowserSupport.h"

namespace ${this.namespace()}
{
class FilterCell : public ${this.filterStruct()},
                   public IMCell,
                   public IMProperties,
                   public IMQtProperties,
                   public IMXMLFilter,
                   public IMHeader,
                   public IMBrowserSupport,
                   public IMFormManager
{
public:
  FilterCell();
  explicit FilterCell( const ${this.filterStruct()}& src );
  explicit FilterCell( const FilterCell& src );

  // IMCell
  void Clear() override;
  void Copy( const IMCell& src ) override;
  IMCell* Clone() const override;

  // IMProperties
  CString GetCaptionName() override;
  void EnumPropertyPages( MPropertyPageArray& pages ) override;

  // IMXMLFilter
  OMPCODE GetReportType() override;
  void SerializeXMLData( XMLNode node, bool bLoad ) override;
  void EnumHistoryComboQt( omp::vector< COmpString >& hc ) override;

  // IMHeader
  void GetHeader( ITTPArray< CGXStyle >& header ) override;

  // IMFormManager
  void EnumDataTypes( ITLongArray& types ) override;

  enum enHids
  {
${hids.join("\n")}
  };
};
}\n`;
    }

    generateFilterCellCpp() {
        const addHeaderCols = this.columns.filter(col => col.columnName !== "CODE")
            .map(col => `  AddHeaderColumn( header, "${col.columnNameRus}", Hid_${col.dataMemberName} );`);

        const headers = new Set();
        for (const col of this.columns) {
            getIncludeForSerializeXMLData(col.filterMemberType).forEach(h => headers.add(h));
        }

        return `#include "stdafx.h"

#include "./${this.entities}FilterCell.h"
${[...headers].map(h => `#include ${h}`).join("\n")}
#include "uicore/KMM/MQtPropertyPage.h"
#include "uicore/SmartClearCopyCell.h"

#include "ui_${this.entities}FilterPage.h"

namespace
{
enum
{
  ppMain = 1,
};
}

namespace ${this.namespace()}
{
FilterCell::FilterCell()
{
  Clear();
}

FilterCell::FilterCell( const FilterCell& src )
{
  Copy( src );
}

FilterCell::FilterCell( const ${this.filterStruct()}& src )
{
  Clear();
  ${this.filterStruct()}::copy( src );
}

void FilterCell::Clear()
{
  omp::SmartClearCell( *this );
}

void FilterCell::Copy( const IMCell& src )
{
  omp::SmartCopyCell( *this, src );
}

IMCell* FilterCell::Clone() const
{
  return new FilterCell( *this );
}

class UiFilterPage : public IQtUiFormMixin< UiFilterPage, Ui::${this.entities}FilterPage >
{
public:
  UiFilterPage( FilterCell& data_ ) : data{ data_ }
  {}

  void onInitDialog( MQtPropertyPageWidget* wgt ) override;
  void doDataExchange( QtDataExchange& dx ) override;

public:
  FilterCell& data;
};

CString FilterCell::GetCaptionName()
{
  return "${this.entities_hr_name}";
}

void FilterCell::EnumPropertyPages( MPropertyPageArray& pages )
{
  pages.Add( new MQtPropertyPage( ppMain, this, new UiFilterPage( *this ) ) );
}

OMPCODE FilterCell::GetReportType()
{
  return 123456_СГЕНЕРИРОВАТЬ;
}

void FilterCell::SerializeXMLData( XMLNode node, bool bLoad )
{
  BeginXMLVarGroup( "${this.entities}_FilterCell" );

${this.columns.filter(col => col.filterMemberName !== "Codes")
                .map(col => `  SerializeXMLVar( ${col.filterMemberName} );`)
                .join("\n")}
}

void FilterCell::EnumHistoryComboQt( omp::vector< COmpString >& hc )
{
  hc.push_back( "cbNum" );
}

void FilterCell::GetHeader( ITTPArray< CGXStyle >& header )
{
${addHeaderCols.join("\n")}

  IMHeader::SetWrapText( header, true );
}

void FilterCell::EnumDataTypes( ITLongArray& types )
{}

void UiFilterPage::onInitDialog( MQtPropertyPageWidget* wgt )
{}

void UiFilterPage::doDataExchange( QtDataExchange& dx )
{
  DDX_QtLikeSensString( dx, cbNum, cbNumCs, data.Num );
}
}\n`;
    }

    generateListHeader() {
        return `#pragma once

namespace ${this.namespace()}
{
class List : public MDataManager
{
  DECLARE_DYNCREATE( List )

public:
  List();
  ~List() override;

  void GetReportCaptionStr( CString& caption ) override;

  void LoadData( OMPCODE reporttype, IMCell* flt ) override;

  IMCell* GetNewChild() override;

  void DefineCustomLocalMenu( CMenu& menu, ROWCOL row, ROWCOL col ) override;

  void OnMovedCurrentRow( ROWCOL row ) override;
  BOOL EnableRefershReportView() override;

  OMP_DECLARE_PRIVATE( List );
};
}\n`;
    }

    generateListCpp() {
        return `#include "stdafx.h"

#include "./${this.entities}Cell.h"
#include "./${this.entities}FilterCell.h"
#include "./${this.entities}List.h"
#include "${this.non_ui_lib}/${this.entities}Service.h"
#include "OmUtilsUI/BaseMenuUtils.h"

namespace ${this.namespace()}
{
class List::Private
{
public:
  Private( List& q_ ) : q{ q_ }
  {}

  FilterCell& GetFilter();

  List& q;
};

IMPLEMENT_DYNCREATE( List, MDataManager )

List::List() : d{ *new Private{ *this } }
{}

List::~List()
{
  delete &d;
}

void List::GetReportCaptionStr( CString& caption )
{
  caption = "${this.entities_hr_name}";
}

void List::LoadData( OMPCODE reporttype, IMCell* flt )
{
  const auto& f = dynamic_cast< FilterCell& >( *flt );

  COmpPtr< I${this.entities}Service > service;
  auto dataVec{ service->LoadByFilter( f ) };

  for( const auto& data : dataVec )
    AddCell( new Cell( *data ) );

  LoadAutoColumnsData();
}

IMCell* List::GetNewChild()
{
  return new Cell();
}

void List::DefineCustomLocalMenu( CMenu& menu, ROWCOL row, ROWCOL col )
{
  // add_omp_menu_cmd( menu, "Команда", [ this ]() { d.OnCmdHandler(); } );
}

void List::OnMovedCurrentRow( ROWCOL row )
{
  MDataManager::OnMovedCurrentRow( row );

  // Cell* cell = GetRowDataCast( row );
  // SendReportsReload( cell ? cell->Code : -1, 0, ID_DATATYPE_YOUR_DT );
}

BOOL List::EnableRefershReportView()
{
  return TRUE;
}

FilterCell& List::Private::GetFilter()
{
  return dynamic_cast< FilterCell& >( *q.GetFilter() );
}
}

IMCell* Get${this.entities}Filter( const OmpReportParams& )
{
  return new ${this.namespace()}::FilterCell();
}

void Run${this.entities}List( const IMCell& f )
{
  RunOMPFormReport( RUNTIME_CLASS( ${this.namespace()}::List ), f.Clone() );
}\n`;
    }

    generateUiServiceHeader() {
        return `#pragma once
#include "OIDs.h"
#include "${this.non_ui_lib}/${this.entities}Data.h"

struct ${this.entities}BrowserParams : CCopyClearBase< ${this.entities}BrowserParams >
{
  bool IsMultiSelect{ false };
};

struct I${this.entities}UiService : IOmpUnknown
{
  virtual void RunList( const ${this.filterStruct()}& flt ) = 0;
  virtual omp::shared_vec< ${this.dataStruct()} > RunBrowser( const ${this.filterStruct()}& flt, const ${this.entities}BrowserParams& params ) = 0;
};

DECLARE_DEFAULT_OID( I${this.entities}UiService, OID_${this.entities}UiService );\n`;
    }

    generateUiServiceCpp() {
        return `#include "stdafx.h"

#include "./${this.entities}Cell.h"
#include "./${this.entities}FilterCell.h"
#include "./${this.entities}List.h"
#include "./${this.entities}UiService.h"
#include "uicore/BrowserProvider.h"

namespace ${this.namespace()}
{
class ServiceImpl : public I${this.entities}UiService
{
public:
  void RunList( const ${this.filterStruct()}& flt ) override;
  omp::shared_vec< ${this.dataStruct()} > RunBrowser( const ${this.filterStruct()}& flt, const ${this.entities}BrowserParams& params ) override;
};
}

OMP_OBJECT_ENTRY_AUTO_NS( OID_${this.entities}UiService, ${this.namespace()}, ServiceImpl );

namespace ${this.namespace()}
{
void ServiceImpl::RunList( const ${this.filterStruct()}& flt )
{
  RunOMPFormReport( RUNTIME_CLASS( List ), new FilterCell( flt ) );
}

omp::shared_vec< ${this.dataStruct()} > ServiceImpl::RunBrowser( const ${this.filterStruct()}& flt, const ${this.entities}BrowserParams& params )
{
  FilterCell filter;
  List list;

  CBrowserProvider browserProvider{ list, filter };
  browserProvider.SetMultiSelect( params.IsMultiSelect );

  if( IDOK != browserProvider.DoModal() )
    return {};

  omp::shared_vec< ${this.dataStruct()} > result;
  for( const auto* cell : omp::cast_container< Cell* >( browserProvider.GetSelected() ) )
    result.emplace_back( std::make_shared< ${this.dataStruct()} >( *cell ) );

  return result;
}
}\n`;
    }

    generateCellPageUi() {
        return `<?xml version="1.0" encoding="UTF-8"?>
<ui version="4.0">
 <class>${this.entities}CellPage</class>
 <widget class="QWidget" name="${this.entities}CellPage">
  <property name="geometry">
   <rect>
    <x>0</x>
    <y>0</y>
    <width>345</width>
    <height>144</height>
   </rect>
  </property>
  <property name="windowTitle">
   <string>Свойства</string>
  </property>
  <layout class="QVBoxLayout" name="verticalLayout">
   <item>
    <layout class="QGridLayout" name="gridLayout">
     <item row="0" column="0">
      <widget class="QLabel" name="label">
       <property name="text">
        <string>Номер: </string>
       </property>
      </widget>
     </item>
     <item row="0" column="1">
      <widget class="QLineEdit" name="leNum"/>
     </item>
    </layout>
   </item>
   <item>
    <spacer name="verticalSpacer">
     <property name="orientation">
      <enum>Qt::Vertical</enum>
     </property>
     <property name="sizeHint" stdset="0">
      <size>
       <width>20</width>
       <height>103</height>
      </size>
     </property>
    </spacer>
   </item>
  </layout>
 </widget>
 <resources/>
 <connections/>
</ui>\n`;
    }

    generateFilterCellPageUi() {
        return `<?xml version="1.0" encoding="UTF-8"?>
<ui version="4.0">
 <class>${this.entities}FilterPage</class>
 <widget class="QWidget" name="${this.entities}FilterPage">
  <property name="geometry">
   <rect>
    <x>0</x>
    <y>0</y>
    <width>321</width>
    <height>196</height>
   </rect>
  </property>
  <property name="windowTitle">
   <string>Фильтр</string>
  </property>
  <layout class="QVBoxLayout" name="verticalLayout">
   <item>
    <layout class="QGridLayout" name="gridLayout">
     <item row="0" column="0">
      <widget class="QLabel" name="label">
       <property name="text">
        <string>Номер: </string>
       </property>
      </widget>
     </item>
     <item row="0" column="1">
      <widget class="QOmpComboBox" name="cbNum">
       <property name="sizePolicy">
        <sizepolicy hsizetype="Expanding" vsizetype="Fixed">
         <horstretch>0</horstretch>
         <verstretch>0</verstretch>
        </sizepolicy>
       </property>
       <property name="editable">
        <bool>true</bool>
       </property>
      </widget>
     </item>
     <item row="0" column="2">
      <widget class="QOmpComboBox" name="cbNumCs">
       <property name="sizeAdjustPolicy">
        <enum>QComboBox::AdjustToContents</enum>
       </property>
      </widget>
     </item>
    </layout>
   </item>
   <item>
    <spacer name="verticalSpacer">
     <property name="orientation">
      <enum>Qt::Vertical</enum>
     </property>
     <property name="sizeHint" stdset="0">
      <size>
       <width>20</width>
       <height>153</height>
      </size>
     </property>
    </spacer>
   </item>
  </layout>
 </widget>
 <customwidgets>
  <customwidget>
   <class>QOmpComboBox</class>
   <extends>QComboBox</extends>
   <header>qompcombobox.h</header>
  </customwidget>
 </customwidgets>
 <resources/>
 <connections/>
</ui>\n`;
    }

    generateInstructions() {
        return `#instructions

Add next lines to to \`${this.ui_lib}/${this.ui_lib}Run.cpp\`:

\`\`\`cpp
run${this.entities} = "TASK_CODE"fix, // ${this.entities_hr_name}

// ...
OMP_RUN( run${this.entities}, Get${this.entities}Filter, Run${this.entities}List )
\`\`\`

Add next lines to \`core/OIDs.h\`:
\`\`\`cpp
#define OID_${this.entities}Service (OID_${this.non_ui_lib} + ?)

#define OID_${this.entities}UiService (OID_${this.ui_lib} + ?)
\`\`\`

Add next line to \`OmMiscUI/XmlDocIDs.h\`
\`\`\`
XmlDoc_${this.entity} = _NEW_ID,
\`\`\`

Add next line to \`OmMiscUI/XmlDocs.h\`
\`\`\`
XMLDOC          ( XmlDoc_${this.entity}, ${this.non_ui_lib.substring(2)}, "YOUR_OBJ_NAME"_err )
\`\`\`
`;
    }

    generateDataStructCode() {
        const members = this.columns.map(col => `\n${TAB}${this.generateDataMemberTypeCode(col)} ${col.dataMemberName};`);
        return `struct ${this.dataStruct()} : CCopyClearBase< ${this.dataStruct()} >\n{${members.join("")}\n};`;
    }

    generateFilterStructCode() {
        const members = this.columns.filter(col => !!col.filterMemberName)
            .map(col => `\n${TAB}${col.filterMemberType} ${col.filterMemberName};`);
        return `struct ${this.filterStruct()} : CCopyClearBase< ${this.filterStruct()} >\n{${members.join("")}\n};`;
    }

    generateFieldDescCode() {
        const genAddSqlStmt = (col) => {
            if(col.columnName === "CODE") {
                return "AddSqlPK";
            }

            return "AddSqlField";
        }

        const fdColumns = this.columns.map(col => `  ${dup(genAddSqlStmt(col), 16)}( ${dup(`"${col.columnName}"`, 19)}, &${col.dataMemberName} );\n`);

        return `BEGIN_INC_FIELD_DESC_EX( FdImpl, ${this.dataStruct()}, "${this.table_name}", "${this.sequence_name}" )
${fdColumns.join("")}END_INC_FIELD_DESC()`;
    }

    generateFdMakeWhereCode() {

        const filteringColumns = this.columns.map(col => `  filtering( query, flt.${col.filterMemberName}, _ac( "A", "${col.columnName}" ) );\n`);
        return `void FdMakeWhere( TwQuery& query, const ${this.filterStruct()}& flt )
{
  using namespace omp::sql;

${filteringColumns.join("")}}`;
    }

    namespace() { return `${this.entities}`; }

    dataStruct() { return `${this.entity}Data`; }

    filterStruct() { return `${this.entities}Filter`; }

    dataHeaderFilePath() { return `${this.non_ui_lib}/${this.dataHeaderFileName()}`; }

    dataHeaderFileName() { return `${this.entities}Data.h`; }

    generateDataMemberTypeCode(col) {
        if (col.dataMemberType === "COmpStringT") {
            return `COmpStringT< ${col.columnDataLength} >`;
        }
        return `${col.dataMemberType}`;
    }
}

function generateNewDirectoryCpp(opts) {
    return new DirectoryCppGenerator(opts).generate();
}
