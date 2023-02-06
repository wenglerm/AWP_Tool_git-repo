from excelParser import *
import mysql.connector as sqlcnx
from db_prerequesits import *

cnx = sqlcnx.connect(**db_config)
cursor = cnx.cursor()

def createDatabae(cursor):
    cursor.execute("CREATE DATABASE awp_tool_db")

def createTable(cursor):
    cursor.execute(MODELDATA_TABLE)

if __name__ == '__main__':
    createDatabae(cursor)
    createTable(cursor)
    cnx.commit()
    cursor.close()
    cnx.close()
