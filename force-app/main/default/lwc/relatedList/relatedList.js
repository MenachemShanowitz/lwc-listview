import { LightningElement, api, track, wire } from "lwc";
import { getRecord, getFieldValue } from "lightning/uiRecordApi";
import { getObjectInfo } from 'lightning/uiObjectInfoApi';


export default class RelatedList extends LightningElement {
  _title;
  @api
  get title() {
    return this._title || (this.objectInfo && this.objectInfo.labelPlural) || this.sObject;
  }
  set title(value) {
    this._title = value;
  }
  @api recordId;
  @api objectApiName
  @api sObject;
  @api fields;
  @api sortedBy;
  @api sortedDirection;
  _filter;
  @api
  get filter() {
    if (this._filter) {
      return this._filter + ' AND ' + this.parentRelationship;
    }
    return this.parentRelationship;
  }
  set filter(value) {
    this._filter = value;
  }
  @api hideCheckboxColumn;
  @api enableInfiniteLoading;
  @api recordsPerBatch=50;
  @api initialRecords;
  @api showSoql;
  @api parentRecordField;
  @api childRecordField;

  _parentRecordField;
  _childRecordField;
  @track objectInfo;

  @wire(getObjectInfo, { objectApiName: '$sObject' })
  wiredObjectInfo({ error, data }) {
    if (data) {
      this.objectInfo = data;
    } else if (error) {
      this.error(error.statusText + ': ' + error.body.message);
    }
  }


  @wire(getRecord, { recordId: "$recordId", fields: "$fullParentRecordField" })
  parentRecord;

  get fullParentRecordField() {
    return this.objectApiName + "." + this.parentRecordField;
  }

  get parentRecordId() {
    if (this.parentRecordField && this.parentRecord && this.parentRecord.data)
      return getFieldValue(this.parentRecord.data, this.fullParentRecordField);
    return "";
  }

  get parentRelationship() {
    if (this.parentRecordField && this.childRecordField) {
      if (this.parentRecordId) {
        return " " + this.childRecordField + " = '" + this.parentRecordId + "'";
      }
      return " " + this.childRecordField + " = ''"; // return empty string so the query returns no results
    }
    return "";
  }
}
