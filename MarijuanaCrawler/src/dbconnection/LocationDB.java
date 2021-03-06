package dbconnection;

public class LocationDB {
	// Constants
	// ----------------------------------------------------------------------------------

	@SuppressWarnings("unused")
	private static final long serialVersionUID = 1L;

	// Properties
	// ---------------------------------------------------------------------------------

	Integer id;
	String country;
	String state;
	String city;
	String latitude;
	String longitude;
	String nelatitude;
	String nelongitude;
	String swlatitude;
	String swlongitude;

	// Getters/setters
	// ----------------------------------------------------------------------------

	public Integer getId() {
		return id;
	}

	public void setId(Integer id) {
		this.id = id;
	}

	public String getCountry() {
		return country;
	}

	public void setCountry(String country) {
		this.country = country;
	}

	public String getState() {
		return state;
	}

	public void setState(String state) {
		this.state = state;
	}

	public String getCity() {
		return city;
	}

	public void setCity(String city) {
		this.city = city;
	}

    public String getLatitude() {
        return latitude;
    }

    public void setLatitude(String latitude) {
        this.latitude = latitude;
    }

    public String getLongitude() {
        return longitude;
    }

    public void setLongitude(String longitude) {
        this.longitude = longitude;
    }

    public String getNelatitude() {
        return nelatitude;
    }

    public void setNelatitude(String nelatitude) {
        this.nelatitude = nelatitude;
    }

    public String getNelongitude() {
        return nelongitude;
    }

    public void setNelongitude(String nelongitude) {
        this.nelongitude = nelongitude;
    }

    public String getSwlatitude() {
        return swlatitude;
    }

    public void setSwlatitude(String swlatitude) {
        this.swlatitude = swlatitude;
    }

    public String getSwlongitude() {
        return swlongitude;
    }

    public void setSwlongitude(String swlongitude) {
        this.swlongitude = swlongitude;
    }

	// Object overrides
	// ---------------------------------------------------------------------------

	/**
		 */
	@Override
	public boolean equals(Object other) {
		// TODO implement this
		return false;
	}

	/**
		 */
	@Override
	public int hashCode() {
		// TODO implement this
		return 0;
	}

	/**
		 */
	@Override
	public String toString() {
		// TODO implement this
		return this.country + ", " + this.state + ", " + this.city;
	}

	// Custom methods
	public boolean isValid() {
		return this.country != null && this.state != null && this.city != null;
	}
}
