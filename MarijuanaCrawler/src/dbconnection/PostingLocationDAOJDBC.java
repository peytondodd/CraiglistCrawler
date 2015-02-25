package dbconnection;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import commonlib.Globals;

public class PostingLocationDAOJDBC implements PostingLocationDAO {
    private final String SQL_SELECT_ALL = "SELECT * FROM posting_location";
    private final String SQL_SELECT_BY_ID = "SELECT * FROM posting_location WHERE location_fk = ?";
    private final String SQL_INSERT = "INSERT INTO posting_location (state, city, latitude, longitude, location_fk) values (?, ?, ?, ?, ?)";

    private final DAOFactory daoFactory;

    public PostingLocationDAOJDBC(DAOFactory daoFactory) throws SQLException {
        this.daoFactory = daoFactory;
    }

    private PostingLocation constructPostingLocationObject(ResultSet resultSet) throws SQLException {
        final PostingLocation location = new PostingLocation();
        
        location.setState(resultSet.getString("state"));
        if (resultSet.wasNull()) {
            location.setState(null);
        }
        
        location.setCity(resultSet.getString("city"));
        if (resultSet.wasNull()) {
            location.setCity(null);
        }
        
        location.setLatitude(resultSet.getString("latitude"));
        if (resultSet.wasNull()) {
            location.setLatitude(null);
        }
        
        location.setLongitude(resultSet.getString("longitude"));
        if (resultSet.wasNull()) {
            location.setLongitude(null);
        }
        
        location.setLocation_fk(resultSet.getInt("location_fk"));
        if (resultSet.wasNull()) {
            location.setLocation_fk(null);
        }
        
        return location;
    }
    
    @Override
    public List<PostingLocation> get() throws SQLException {
        Connection connection = null;
        PreparedStatement preparedStatement = null;
        ResultSet resultSet = null;

        try {
            connection = this.daoFactory.getConnection();
            preparedStatement = DAOUtil.prepareStatement(connection, this.SQL_SELECT_ALL, false);
            resultSet = preparedStatement.executeQuery();

            final List<PostingLocation> locations = new ArrayList<PostingLocation>();
            while (resultSet.next()) {
                final PostingLocation location = this.constructPostingLocationObject(resultSet);
                locations.add(location);
            }

            return locations;
        } catch (final SQLException e) {
            Globals.crawlerLogManager.writeLog("Get posting_location fails");
            Globals.crawlerLogManager.writeLog(e.getMessage());

            return null;
        } finally {
            DAOUtil.close(connection, preparedStatement, resultSet);
        }
    }

    @Override
    public PostingLocation get(int locationId) throws Exception {
        Connection connection = null;
        PreparedStatement preparedStatement = null;
        ResultSet resultSet = null;

        try {
            connection = this.daoFactory.getConnection();
            
            final Object[] values = { locationId };
            
            preparedStatement = DAOUtil.prepareStatement(connection, this.SQL_SELECT_BY_ID, false, values);
            resultSet = preparedStatement.executeQuery();

            PostingLocation locations = null;
            if (resultSet.next()) {
                locations = new PostingLocation();
                locations = this.constructPostingLocationObject(resultSet);
            }
            
            if (resultSet.next()) {
                Globals.crawlerLogManager.writeLog("There are two locations with the same id " + locationId);
                throw new Exception("There are two locations with the same id");
            }

            return locations;
        } catch (final SQLException e) {
            Globals.crawlerLogManager.writeLog("Get posting_location fails");
            Globals.crawlerLogManager.writeLog(e.getMessage());

            return null;
        } finally {
            DAOUtil.close(connection, preparedStatement, resultSet);
        }
    }

    @Override
    public boolean create(PostingLocation location) throws SQLException {
        if (!location.isValid()) {
            return false;
        }

        Connection connection = null;
        PreparedStatement preparedStatement = null;
        ResultSet resultSet = null;

        try {
            connection = this.daoFactory.getConnection();

            final Object[] values = { location.getState(),
                    location.getCity(), location.getLatitude(),
                    location.getLongitude(), location.getLocation_fk() };

            preparedStatement = DAOUtil.prepareStatement(connection,
                    this.SQL_INSERT, false, values);

            Globals.crawlerLogManager.writeLog(preparedStatement.toString());

            preparedStatement.executeUpdate();

            return true;
        } catch (final SQLException e) {
            Globals.crawlerLogManager.writeLog("Insert into table posting_location fails");
            Globals.crawlerLogManager.writeLog(e.getMessage());

            return false;
        } finally {
            DAOUtil.close(connection, preparedStatement, resultSet);
        }
    }
   
}