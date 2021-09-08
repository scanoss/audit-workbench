export class Querys {
  /** SQL CREATE SCAN TABLES * */

  SQL_CREATE_TABLE_RESULTS =
    'CREATE TABLE IF NOT EXISTS results (id integer primary key asc,md5_file text,file_path text ,fileid integer, vendor text, component text, version text, latest_version text, cpe text, license text, url text, lines text, oss_lines text, matched text, filename text, size text, idtype text, md5_comp text,compid integer,purl text,identified integer,ignored integer,file_url text,source text);';

  SQL_CREATE_TABLE_FILE_INVENTORIES =
    'CREATE TABLE IF NOT EXISTS file_inventories (id integer primary key asc, resultid integer not null, inventoryid integer not null, FOREIGN KEY (inventoryid) REFERENCES inventories(id) ON DELETE CASCADE);';

  SQL_CREATE_TABLE_INVENTORY =
    'CREATE TABLE IF NOT EXISTS inventories (id integer primary key,version text not null ,compid integer not null,purl text, usage text, notes text, url text, license_name text);';

  SQL_CREATE_TABLE_STATUS =
    'CREATE TABLE IF NOT EXISTS status (files integer, scanned integer default 0, status text, project integer, user text, message text, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, type text, size text);';

  COMPDB_SQL_CREATE_TABLE_COMPVERS =
    'CREATE TABLE IF NOT EXISTS component_versions (id integer primary key asc, name text, version text not null, description text, url text, purl text,source text, UNIQUE(version,purl));';

  COMPDB_SQL_CREATE_TABLE_LICENCES_FOR_COMPVERS =
    'CREATE TABLE IF NOT EXISTS license_component_version (id integer primary key asc, cvid integer not null, licid integer not null, unique(cvid,licid));';

  COMPDB_LICENSES_TABLE =
    "CREATE TABLE IF NOT EXISTS licenses (id integer primary key asc, spdxid text default '', name text not null, fulltext text default '', url text default '', unique(spdxid,name));";

  SQL_DB_TABLES =
    this.SQL_CREATE_TABLE_RESULTS +
    this.SQL_CREATE_TABLE_FILE_INVENTORIES +
    this.SQL_CREATE_TABLE_INVENTORY +
    this.COMPDB_SQL_CREATE_TABLE_COMPVERS +
    this.COMPDB_SQL_CREATE_TABLE_LICENCES_FOR_COMPVERS +
    this.COMPDB_LICENSES_TABLE;

  /** SQL SCAN INSERT* */
  // SQL INSERT RESULTS
  SQL_INSERT_RESULTS =
    'INSERT or IGNORE INTO results (md5_file,vendor,component,version,latest_version,license,url,lines,oss_lines,matched,filename,idtype,md5_comp,purl,file_path,identified,ignored,file_url,source) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';

  SQL_UPDATE_RESULTS_IDTYPE_FROM_PATH = `UPDATE results SET source=?,idtype='file' WHERE file_path=?`;

  // SQL NEW INVENTORY
  SQL_SCAN_INVENTORY_INSERT =
    'INSERT INTO inventories (compid,version ,purl ,usage, notes, url, license_name) values (?,?,?,?,?,?,?);';

  // SQL INSERT FILE INVENTORIES
  SQL_INSERT_FILE_INVENTORIES = 'INSERT into file_inventories (resultid,inventoryid) values (?,?);';

  // SQL DELETE FILE INVENTORY
  SQL_DELETE_FILE_INVENTORIES = 'DELETE FROM file_inventories WHERE resultid IN ';

  //  UPDATE INVENTORY BY ID
  SQL_UPDATE_INVENTORY_BY_ID =
    'UPDATE inventories SET compid=?,version=?,purl=?,usage=?, notes=?, url=?, license_name=?  where id=?;';

  SQL_SELECT_INVENTORY_COMPONENTS = `SELECT  i.id,i.usage,i.purl,i.notes,i.url,i.license_name,i.version,cv.name
  FROM inventories i INNER JOIN component_versions cv ON cv.version=i.version AND cv.purl=i.purl;`;

  //  UPDATE INVENTORY BY PURL/VERSION
  SQL_UPDATE_INVENTORY_BY_PURL_VERSION =
    'UPDATE inventories SET compid=?,version=?,purl=?,usage=?, notes=?, url=?, license_name=? where purl=? and version=?;';

  SQL_COMPDB_COMP_VERSION_UPDATE =
    'UPDATE component_versions  SET name=?,version=?, description=?, url=?,purl=? where id=?;';

  SQL_FILES_UPDATE_IDENTIFIED = 'UPDATE results SET identified=1 WHERE id IN ';

  /** SQL COMPONENTS TABLES INSERT* */
  // SQL INSERT INTO LICENSES
  SQL_CREATE_LICENSE = 'INSERT OR IGNORE INTO licenses (spdxid,name,fulltext,url) VALUES(?,?,?,?);';

  // SQL INSERT INTO  COMPONENT VERSIONS
  COMPDB_SQL_COMP_VERSION_INSERT =
    'INSERT OR IGNORE INTO component_versions  (name,version, description, url,purl,source) VALUES (?,?,?,?,?,?);';

  // ATTACH A COMPONENT TO A LICENSE
  SQL_LICENSE_ATTACH_TO_COMPONENT_BY_ID = 'INSERT or IGNORE INTO license_component_version (cvid,licid) values (?,?)';

  SQL_ATTACH_LICENSE_BY_PURL_NAME =
    'INSERT or IGNORE INTO license_component_version (cvid,licid) values ((SELECT id FROM component_versions where purl=? and version=?),(SELECT id FROM licenses where name=?));';

  SQL_ATTACH_LICENSE_PURL_SPDXID =
    'INSERT or IGNORE INTO license_component_version (cvid,licid) values ((SELECT id FROM component_versions where purl=? and version=?),(SELECT id FROM licenses where spdxid=?));';

  /** *** SQL SCAN GET * **** */
  SQL_SCAN_SELECT_INVENTORIES_FROM_PATH =
    'SELECT i.id,i.usage,i.compid,i.notes,i.url,i.license_name,i.purl,i.version FROM inventories i INNER JOIN file_inventories fi ON i.id=fi.inventoryid INNER JOIN results r ON r.id=fi.resultid WHERE r.file_path=?;';

  SQL_SCAN_SELECT_INVENTORIES_FROM_PURL_VERSION =
    'SELECT i.id,i.compid,i.usage,i.notes,i.url,i.license_name,i.purl,i.version FROM inventories i WHERE i.purl=? AND i.version=?;';

  // GET INVENTORY BY ID
  SQL_GET_INVENTORY_BY_PURL =
    'SELECT id,compid,usage,notes,url,license_name,purl,version FROM inventories WHERE purl=?;';

  // GET INVENTORY BY ID
  SQL_GET_INVENTORY_BY_ID = 'SELECT id,compid,usage,notes,url,license_name,purl,version FROM inventories WHERE id=?;';

  SQL_SCAN_SELECT_FILE_RESULTS =
    "SELECT id, file_path, url,lines, oss_lines, matched, filename as file, idtype as type, md5_file, md5_comp as url_hash,purl, version,latest_version as latest, identified, ignored, file_url FROM results WHERE file_path=? AND idtype!='none' order by file_path;";

  SQL_SCAN_SELECT_FILE_RESULTS_NO_MATCH =
    'SELECT DISTINCT id, file_path, url,lines, oss_lines, matched, filename as file, idtype as type, md5_file, md5_comp as url_hash,purl, version,latest_version as latest, identified, ignored, file_url FROM results WHERE file_path=? ORDER BY file_path;';

  // GET ALL THE INVENTORIES ATTACHED TO A COMPONENT
  SQL_SELECT_ALL_INVENTORIES_ATTACHED_TO_COMPONENT =
    'SELECT i.id,i.usage,i.purl,i.notes,i.url,i.license_name from inventories i, component_versions cv where i.purl=cv.purl and i.version=cv.version and cv.purl=? and cv.version=?;';

  // GET ALL THE INVENTORIES ATTACHED TO A FILE BY PATH
  SQL_SELECT_ALL_INVENTORIES_FROM_FILE =
    'SELECT i.id,i.usage,i.notes,i.purl,i.version,i.license_name,i.url FROM inventories i, file_inventories fi WHERE i.id=fi.inventoryid and fi.resultid=?;';

  SQL_SELECT_ALL_FILES_ATTACHED_TO_AN_INVENTORY_BY_ID =
    'SELECT DISTINCT r.id,r.file_path as path,r.identified as identified,r.ignored as ignored,i.purl,i.version FROM inventories i INNER JOIN file_inventories fi ON fi.inventoryid=i.id INNER JOIN results r ON r.id=fi.resultid WHERE i.id=?';

  // SQL_GET_COMPONENTS TABLE
  SQL_GET_COMPONENT = 'SELECT id,name,version,description,url,purl from component_versions where purl like ?';

  SQL_GET_COMPONENT_BY_ID =
    'SELECT cv.name as name,cv.id as compid,cv.purl,cv.url,cv.version from component_versions cv where cv.id=?;';

  SQL_GET_LICENSES_BY_COMPONENT_ID =
    'SELECT l.id,l.name,l.spdxid FROM licenses l where l.id in (SELECT lcv.licid from license_component_version lcv where lcv.cvid=?);';

  SQL_GET_COMPV_LICENSE_BY_COMPID =
    'SELECT li.name,li.id,li.spdxid from licenses li where li.id in (SELECT cvl.licid from license_component_version cvl where cvl.cvid=?);';

  SQL_GET_COMPID_FROM_PURL = 'SELECT id from component_versions where purl like ? and version like ?;';

  SQL_GET_COMPONENT_BY_PURL_VERSION =
    'SELECT cv.name as name,cv.id as compid,cv.purl,cv.url,cv.version from component_versions cv where cv.purl=? and cv.version=?;';

  SQL_GET_COMPONENT_BY_PURL_ENGINE =
    ' SELECT DISTINCT comp.url AS comp_url,comp.id AS compid,comp.name AS comp_name,lic.url AS license_url,lic.name AS license_name,lic.spdxid AS license_spdxid,comp.purl,comp.version,lic.license_id FROM components AS comp LEFT JOIN license_view lic ON comp.id=lic.cvid WHERE comp.source=(SELECT source FROM components WHERE purl=? limit 1) AND comp.purl=?;';

  // GET ALL COMPONENTES
  SQL_GET_ALL_COMPONENTS =
    'SELECT DISTINCT comp.url AS comp_url,comp.id AS compid,comp.name AS comp_name,lic.url AS license_url,lic.name AS license_name,lic.spdxid AS license_spdxid,comp.purl,comp.version,lic.license_id FROM components AS comp LEFT JOIN license_view lic ON comp.id=lic.cvid;';

   // GET ALL COMPONENTES
  SQL_GET_ALL_DETECTED_COMPONENTS = 'SELECT DISTINCT comp.url AS comp_url,comp.id AS compid,comp.name AS comp_name,lic.url AS license_url,lic.name AS license_name,lic.spdxid AS license_spdxid,comp.purl,comp.version,lic.license_id FROM components AS comp LEFT JOIN license_view lic ON comp.id=lic.cvid WHERE source="engine";';

  // GET LICENSE
  SQL_SELECT_LICENSE = 'SELECT id, spdxid, name, url FROM licenses WHERE ';

 // GET LICENSES
 SQL_SELECT_ALL_LICENSES = 'SELECT id, spdxid, name, url FROM licenses ORDER BY name ASC;';

  // GET LICENSE ID BY NAME OR SPDXID
  COMPDB_SQL_GET_LICENSE_ID_FROM_SPDX_NAME = 'SELECT id FROM licenses WHERE licenses.name=? or licenses.spdxid=?;';

  // GET ALL THE INVENTORIES
  SQL_GET_ALL_INVENTORIES = 'SELECT id,compid,usage,notes,url,license_name,purl,version from inventories;';

  SQL_SELECT_FILES_FROM_PURL_VERSION = `
    SELECT r.id,r.file_path AS path,r.identified,r.ignored,r.matched,r.idtype AS type,r.lines,r.oss_lines,r.file_url, fi.inventoryid
    FROM results r
    LEFT JOIN file_inventories fi ON r.id=fi.resultid
    WHERE r.purl=? AND r.version=? GROUP BY r.file_path;`;

  SQL_SELECT_FILES_FROM_PURL = `SELECT r.id,r.file_path AS path,r.identified,r.ignored,r.matched,r.idtype AS type,r.lines,r.oss_lines,r.file_url, r.version, r.license,r.purl,fi.inventoryid FROM results r
    LEFT JOIN file_inventories fi ON r.id=fi.resultid
    WHERE r.purl=?
    GROUP BY r.file_path;`;

  SQL_UPDATE_IGNORED_FILES = 'UPDATE results SET ignored=1,identified=0 WHERE results.id=?;';

  SQL_RESTORE_IDENTIFIED_FILE_SNIPPET = `UPDATE results SET ignored=0,identified=0 WHERE id IN `;

  SQL_RESTORE_NOMATCH_FILE = `UPDATE results SET ignored=0,identified=0,idtype='none' WHERE source='nomatch' AND id IN `;

  SQL_RESTORE_FILTERED_FILE = `DELETE FROM results WHERE source='filtered' AND id IN`;

  SQL_SELECT_INVENTORIES_NOT_HAVING_FILES = ` SELECT i.id FROM inventories i  WHERE i.id NOT IN (SELECT inventoryid FROM file_inventories);`;

  SQL_GET_FILE_BY_PATH = 'SELECT file_path AS path,identified,ignored FROM results WHERE results.file_path=?;';

  SQL_GET_SPDX_COMP_DATA =
    'SELECT DISTINCT cv.purl,cv.version,cv.url,cv.name,i.license_name FROM component_versions cv INNER JOIN inventories i ON cv.purl=i.purl AND cv.version=i.version GROUP BY i.version;';

  // SQL_GET_CSV_DATA = `SELECT i.id,i.usage,i.notes,i.license_name,i.purl,i.version,r.file_path AS path FROM inventories i INNER JOIN file_inventories fi ON fi.inventoryid=i.id INNER JOIN results r ON r.id=fi.resultid;`;

  SQL_GET_CSV_DATA = `SELECT i.id AS inventoryId,r.id AS resultID,i.usage,i.notes,i.license_name AS identified_license,r.license AS detected_license,i.purl,i.version,r.file_path AS path,cv.name AS identified_component,r.component AS detected_component
  FROM inventories i 
  INNER JOIN file_inventories fi ON fi.inventoryid=i.id 
  LEFT JOIN results r ON r.id=fi.resultid INNER JOIN component_versions cv ON cv.purl=i.purl AND cv.version = i.version 
  GROUP BY r.id;`

  SQL_GET_ALL_SUMMARIES = 'SELECT compid,ignored,pending,identified FROM summary;';

  SQL_GET_SUMMARY_BY_PURL_VERSION = 'SELECT identified,pending,ignored FROM summary WHERE purl=? AND version=?;';

  SQL_GET_SUMMARY_BY_PURL =
    'SELECT SUM(identified) AS identified,SUM(pending) AS pending,SUM(ignored) AS ignored FROM summary WHERE purl=? GROUP BY purl;';

  SQL_GET_UNIQUE_COMPONENT = 'SELECT DISTINCT purl,version,license,component,url FROM results GROUP BY purl,version;';

  SQL_DELETE_INVENTORY_BY_ID = 'DELETE FROM inventories WHERE id=?;';

  SQL_SET_RESULTS_TO_PENDING_BY_PATH_PURL_VERSION = 'UPDATE results SET ignored=0,identified=0 WHERE results.id = ?;';

  SQL_SET_RESULTS_TO_PENDING_BY_INVID_PURL_VERSION =
    'UPDATE results SET identified=0 WHERE id IN (SELECT resultid FROM file_inventories where inventoryid=?)';

  SQL_GET_RESULTS_SUMMARY =
    `SELECT (SELECT COUNT(*) FROM results r WHERE r.identified = 1 AND md5_file!="") AS "identified", (SELECT COUNT(*) FROM results r WHERE r.ignored = 1 AND md5_file!="" ) AS "ignored", (SELECT COUNT(*) FROM results r WHERE (r.identified = 0 AND r.ignored = 0 AND md5_file!="" AND source="engine")) AS "pending", (SELECT COUNT(*) FROM results WHERE idtype !="none" AND md5_file!="" AND source="engine") AS "detected";`;
}
